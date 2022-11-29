//TEAM BRAZIL
//start project flow condition

const flow = response.flows[0];

if (flow.flowConditional && flow.flowConditional.toggleSwitch == "true") {

    const guid = config3.user;
    const selectedFlow = flow.flowConditional.conditionalFlowSelected;
    let verifyMatchAnswerFlowCondition = false;
    let verifyMatchFlowConditionSelected = false;
    let quickReplyes = null;

    function removeStringSlackUnderlineOfGuid() {
        return guid.split('_')[1]
    }

    fetchFibofyUserHistory(removeStringSlackUnderlineOfGuid(), function (data) {
        for (let answer of flow.flowConditional.answers) {
            for (let userText of data) {
                if (userText.text == answer.text) {
                    verifyMatchAnswerFlowCondition = true;
                    for (let flow of data) {
                        if ( flow.possible_flow.flows &&
                            flow.possible_flow.flows[0] &&
                            flow.possible_flow.flows[0]._id == selectedFlow
                        ) {
                            verifyMatchFlowConditionSelected = true;
                        }
                    }
                }
            }

            quickReplyes = (verifyMatchAnswerFlowCondition && verifyMatchFlowConditionSelected) ? answer.quick_replies_flow_condition : aa.message.quick_replies;

            setTimeout(() => {
                response_to_slack(
                    answer.text,
                    response.slack_channel,
                    config3.user,
                    quickReplyes,
                    response.circle,
                    authToken,
                    response.flows[0]
                );
            }, 5000);
            return ;
        }
    });

//end project flow condition
//TEAM BRAZIL