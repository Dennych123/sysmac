// Motion Sequencer - real Node-RED node (not one of the inline function-node bodies
// in js/*.js). Sits between "Split per Station" and "Generate Program XML" in the flow.
//
// Config (set via the edit dialog): node.sequences = { ST1: ["SOL_ST1_STP5_CHK", ...], ... }
// - solenoid operand names typed/dragged manually, same names genname.js already produces
//   and that show up in GlobalVariables.tsv / the generated program comments.
//
// At runtime: validates each configured name against the real actuator list for that
// station (built from msg.payload[station], the groups object split.js produces), drops
// anything that doesn't match (warns instead of erroring), and stores the validated
// ordering into the flow context under "motionSequences" - read by js/gen_all.js exactly
// the way it already reads "groups" (flow.get("motionSequences")).
//
// The two functions below are pure and exported separately so scripts/test.js can
// require() and unit-test them directly, without needing a running Node-RED instance.

function actuatorNamesForStation(stationDevices) {
    return (stationDevices || [])
        .filter(function (d) { return d.io === 'OUT' && (d.jenis === 'CR' || d.jenis === 'SOL'); })
        .map(function (d) { return d.name; })
        .filter(Boolean);
}

function validateSequence(seq, validNames) {
    var validSet = {};
    (validNames || []).forEach(function (n) { validSet[n] = true; });
    var kept = [], warnings = [];
    (seq || []).forEach(function (name) {
        if (validSet[name]) kept.push(name);
        else warnings.push('Motion Sequencer: "' + name + '" is not a solenoid in this station, step skipped.');
    });
    return { sequence: kept, warnings: warnings };
}

module.exports = function (RED) {
    function MotionSequencerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.sequences = config.sequences || {};

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments); };
            try {
                var groups = msg.payload || {};
                var out = {}, allWarnings = [];
                Object.keys(node.sequences).forEach(function (stKey) {
                    var res = validateSequence(node.sequences[stKey], actuatorNamesForStation(groups[stKey]));
                    if (res.sequence.length) out[stKey] = res.sequence;
                    allWarnings = allWarnings.concat(res.warnings);
                });
                node.context().flow.set('motionSequences', out);
                if (allWarnings.length) node.warn(allWarnings.join('\n'));
                node.status(allWarnings.length
                    ? { fill: 'yellow', shape: 'dot', text: allWarnings.length + ' step(s) skipped' }
                    : { fill: 'green', shape: 'dot', text: Object.keys(out).length + ' station(s) sequenced' });
                send(msg);
                if (done) done();
            } catch (err) {
                if (done) done(err); else node.error(err, msg);
            }
        });
    }
    RED.nodes.registerType('motion-sequencer', MotionSequencerNode);
};

module.exports.actuatorNamesForStation = actuatorNamesForStation;
module.exports.validateSequence = validateSequence;
