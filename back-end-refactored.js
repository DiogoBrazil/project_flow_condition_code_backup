//TEAM BRAZIL
//start project flow condition

const flow = response.flows[0];

if (flow.flowConditional && flow.flowConditional.toggleSwitch == "true") {

    const guid = config3.user;
    const selectedFlow = flow.flowConditional.conditionalFlowSelected;
    let verifyMatchAnswerFlowCondition = false;
    let verifyMatchFlowConditionSelected = false;

    function removeStringSlackUnderlineOfGuid() {
        return guid.split('_')[1]
    }

    fetchFibofyUserHistory(removeStringSlackUnderlineOfGuid(), function (data) {
        //runs through the responses make the condition flow
        let quickReplies = null
        let answerText = "";
        for (let answer of flow.flowConditional.answers) {

            //traverses the database query return looking for the user's response from when he interacted with condition flow
            const answerWas = data.find(function (userText) {
                answerText = answer.text;
                return userText.text == answer.text
            });

            if (answerWas) {
                //scrolls through the quick replies of the selected condition flow checking which button will be sent
                const findedCheckedButton = answer.quick_replies_flow_condition.find(function(button){
                    return button.show_qr_button == "true";
                });

                verifyMatchAnswerFlowCondition = (!findedCheckedButton) ? false : true;

                if (verifyMatchAnswerFlowCondition == true) {
                    //scrolls through the returned bank query looking for the selected flow
                    const findedSelectedFlow = data.find(function (flow) {
                        return flow.possible_flow.flows &&
                            flow.possible_flow.flows[0] &&
                            flow.possible_flow.flows[0]._id == selectedFlow
                    });
                    verifyMatchFlowConditionSelected = (!findedSelectedFlow) ? false: true;
                }
            }


            if (verifyMatchAnswerFlowCondition && verifyMatchFlowConditionSelected) {
                quickReplies =  answer.quick_replies_flow_condition.filter(function (element) {return element.show_qr_button == "true"});
                break;
            }


        }
        if (quickReplies) {
            setTimeout(() => {
                response_to_slack(
                    answerText,
                    response.slack_channel,
                    config3.user,
                    quickReplies,
                    response.circle,
                    authToken,
                    response.flows[0]
                );
            }, 5000);
            return ;
        }

        setTimeout(() => {
            response_to_slack(
                aa.message.text,
                response.slack_channel,
                config3.user,
                aa.message.quick_replies,
                response.circle,
                authToken,
                response.flows[0]
            );
        }, 5000);
        return ;
    });

//end project flow condition
//TEAM BRAZIL