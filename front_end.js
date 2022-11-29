/*TEAM BRAZIL*/
function addAlternativeAnswer(id) {
    $(`#message-variation-block-${id}`).append(`
        <div style="display: flex" class="m_reply_text message-variation-holder">
            <input style="width: 75%" placeholder="variation" class="form-control" id="variation-message-input"/>
            <a style="cursor: pointer" onClick="addAlternativeAnswer('${id}')" id="first-plus-button-${id}"><i class="fas fa-plus" style="font-size:25px;color:#00BFFF;text-shadow:2px 2px 4px #000000;margin-left: 10px; margin-top: 7px"></i></i></a>
        </div>
    `);
    $(`#first-plus-button-${id}`).remove();

    if ($(`#message-variation-block-${id}`).children("div").length == 1) {
        const listAlternativeAnswersButton = $(`<a style="cursor: pointer"><i class="fa fa-solid fa-chevron-down" style="font-size:25px;color:#00BFFF;text-shadow:2px 2px 4px #000000; margin-left: 10px; margin-top: 7px"></i></a>`);
        listAlternativeAnswersButton.on('click', function() {
            $(`#message-variation-block-${id}`).each(function (index, element) {
                if ($(element).is(":hidden")) {
                    $(element).show();
                } else {
                    $(element).hide();
                }
            });
        });
        $(`#flow-message-input-${id}`).after(listAlternativeAnswersButton);
    }

}

function hiddenAndShowMessageVariationBlock(id) {
    $(`#message-variation-block-${id}`).each(function (index, element) {
        if ($(element).is(":hidden")) {
            $(element).show();
        } else {
            $(element).hide();
        }
    });
}

//Start the project condition flow
function conditionalFlow_mountBaseStructure() {
    const rootDiv = $('#conditional-flow-root-div');
    if (rootDiv.children().length == 0) {
        const toggleSwitchDiv = $('<div id="toggle-switch-container"></div>');
        const selectFlowDiv = $('<div id="select-flow-container"></div>');
        const ifAnswerWasDiv = $('<div id="if-answer-was-container"></div>');
        rootDiv.append(toggleSwitchDiv);
        rootDiv.append(selectFlowDiv);
        rootDiv.append(ifAnswerWasDiv);
    }
}

//LOAD
function conditionalFlow_load_loadFlowConditional(flowConditional) {
    if (isChecked(flowConditional.toggleSwitch)) {
        //show them
        const toggleSwitch = buildToggleSwitch("answer-conditional-toggle-switch");
        $('#toggle-switch-container').append(toggleSwitch);
        //Events must be inserted after they have been inserted into the HTML
        conditionalFlow_load_addEventToFlowConditionalToggleSwitch(toggleSwitch);
        conditionalFlow_load_buildHeader(flowConditional);

        toggleSwitch.children('label').children('input').prop('checked', true);

    } else {
        //hidden them
        const toggleSwitch = buildToggleSwitch("answer-conditional-toggle-switch");
        $('#toggle-switch-container').append(toggleSwitch);
        conditionalFlow_load_addEventToFlowConditionalToggleSwitch(toggleSwitch);
        conditionalFlow_load_buildHeader(flowConditional);

        conditionalFlow_load_FlowConditionalShowOrHide();
        toggleSwitch.children('label').children('input').prop('checked', false);

    }
}

function conditionalFlow_load_FlowConditionalShowOrHide() {
    $('#select-flow-container').children().hide();
    $('#if-answer-was-container').children().hide();
    $("#conditional-flow-add-button").hide();
}

function conditionalFlow_load_addEventToFlowConditionalToggleSwitch(toggleSwitch) {
    toggleSwitch.on('click', 'input', function () {
        if ($(this).is(':checked')) {
            $('#select-flow-container').children().show();
            $('#if-answer-was-container').children().show();
            $("#conditional-flow-add-button").show();
        } else {
            $('#select-flow-container').children().hide();
            $('#if-answer-was-container').children().hide();
            $("#conditional-flow-add-button").hide();
        }
    });
}

function conditionalFlow_load_buildHeader(flowConditional) {
    $('#select-flow-container').append(conditionalFlow_buildSelectFlow());
    conditionalFlow_addEventOnChangeSelectFlowThenChangeSelectFlowSpan();
    conditionalFlow_addEventOnChangeSelectFlowThenCleanIfAnswerWasContainer();

    $('#conditional-flow-button-div').append(conditionalFlow_buildAddConditionalAnswer());

    $('#answer-conditional-select-flow').children('option').each(function () {
        if($(this).val() == flowConditional.conditionalFlowSelected) {
            $(this).attr('selected', true);
            $('#answer-conditional-select-flow-span').html($(this).attr('data-display'));
        }
    });

    conditionalFlow_load_buildBody(flowConditional);
}

function conditionalFlow_load_buildBody(flowConditional) {
    let i = 0;
    for (let flowConditionAnswer of flowConditional.answers) {
        conditionalFlow_load_createIfAnswerWas(i, flowConditionAnswer);
        i++;
    }
}

function conditionalFlow_load_createIfAnswerWas(id, flowConditionAnswer) {
    //Create and insert the main-div strucutre
    const mainDiv = $(`
        <div id="main-div-${id}">
            <label style="font-weight: 700; font-size: 16px; margin-top: 10px">If answer was:</label><br>
            <select id="if-answer-was-select-${id}" style="width: 300px"></select>            
        </div>
    `);

    mainDiv.append(conditionalFlow_createDeleteButton(mainDiv));
    for (let quickReply of flowConditionAnswer.quick_replies_flow_condition) {
        mainDiv.append(conditionalFlow_load_buildNextFlowOption(quickReply));
    }
    mainDiv.append(conditionalFlow_buildNextFlowOption());
    $('#if-answer-was-container').append(mainDiv);

    const ifAnswerWasSelect = mainDiv.children('select');
    conditionalFlow_addEventOnSelectIfAnswerWasSearchQuickRepliesByFlowId(ifAnswerWasSelect);

    const flowId = $("#answer-conditional-select-flow").find(":selected").attr('value');
    $.get('/ah/flow/fetch/'+flowId, function(datas) {
        let datasObject = JSON.parse(datas);
        let flow = datasObject.flow_data;
        const answer = flow.answer[0];
        if (answer[answer.length - 1].message.quick_replies) {
            const quick_replies = answer[answer.length - 1].message.quick_replies;
            let option = [];
            for (let q of quick_replies) {
                option.push(`<option value="${q.title}">${q.title}</option>`);
            }
            //clean
            ifAnswerWasSelect.html('');
            //add
            ifAnswerWasSelect.append(option);

            //select the flow and change to it
            ifAnswerWasSelect.children('option').each(function () {
                if($(this).val() == flowConditionAnswer.text) {
                    $(this).attr('selected', true);
                }
            });
        }
    });

}

function conditionalFlow_load_buildNextFlowOption(quickReply) {
    const quickReplyDiv = $('<div></div>');
    quickReplyDiv.append('<label style="font-weight: 700; font-size: 16px; margin-right: 206px">Quick Reply:</label>');
    quickReplyDiv.append(conditionalFlow_createDeleteButton(quickReplyDiv));
    quickReplyDiv.append($(`
        <select style="width: 300px">${flows_selector_options}</select><br>
        <i class="fas fa-sign-out-alt" style="margin-top: 10px; margin-right: 4px"></i><span style="font-weight: bold"></span><br>
        <label>Button Name: </label><input id="input-button-flow-condition" type="text"></br>
        <label for='show-ckeck-box-flow-condition'>Show Quick Reply Flow Condition Button</label>
        <input class='show-ckeck-box-flow-condition' type='checkbox' style='margin-right: 5px;'>
    `));

    quickReplyDiv.children('select').children('option').each(function () {
        if($(this).val() == quickReply.payload) {
            $(this).attr('selected', true);
            $(quickReplyDiv.children('span')).html($(this).attr('data-display'));
        }
    });

    quickReplyDiv.children('#input-button-flow-condition').val(quickReply.title);
    quickReplyDiv.children('.show-ckeck-box-flow-condition').prop('checked', isChecked(quickReply.show_qr_button));

    return quickReplyDiv;
}

//BUILD
function conditionalFlow_build_buildFlowConditionalWhenItDoesNotExist() {
    const toggleSwitch = buildToggleSwitch("answer-conditional-toggle-switch");
    $('#toggle-switch-container').append(toggleSwitch);
    //Events must be inserted after they have been inserted into the HTML
    conditionalFlow_build_addEventToFlowConditionalToggleSwitch(toggleSwitch);
}

function conditionalFlow_build_addEventToFlowConditionalToggleSwitch(toggleSwitch) {
    toggleSwitch.on('click', 'input', function () {
        if ($(this).is(':checked')) {
            conditionalFlow_build_buildHeader();
        } else {
            $('#select-flow-container').children().remove();
            $('#if-answer-was-container').children().remove();
            $("#conditional-flow-add-button").remove();
        }
    });
}

function conditionalFlow_build_buildHeader() {
    $('#select-flow-container').append(conditionalFlow_buildSelectFlow());
    conditionalFlow_addEventOnChangeSelectFlowThenChangeSelectFlowSpan();
    conditionalFlow_addEventOnChangeSelectFlowThenCleanIfAnswerWasContainer();

    $('#conditional-flow-button-div').append(conditionalFlow_buildAddConditionalAnswer());
}

function conditionalFlow_buildSelectFlow() {
    const select = buildSelectWithLabelInColumn("answer-conditional-select-flow", flows_selector_options, "Choose conditional flow");
    const span = buildSpan("answer-conditional-select-flow-span", "Select flow to point to");

    const div = $('<div></div>')
    div.append(select).append(span);

    return div;
}

function conditionalFlow_addEventOnChangeSelectFlowThenChangeSelectFlowSpan() {
    $("#answer-conditional-select-flow").on("change", function () {
        const span = $("#answer-conditional-select-flow-span");
        span.html($(this).find(":selected").attr('data-display'));
    });
}

function conditionalFlow_addEventOnChangeSelectFlowThenCleanIfAnswerWasContainer() {
    $("#answer-conditional-select-flow").on("change", function () {
        $("#if-answer-was-container").html('');
    });
}

function conditionalFlow_buildAddConditionalAnswer() {
    const button = buildButton("conditional-flow-add-button", "+ Add Conditional Answer");

    button.on('click', function () {
        conditionalFlow_buildBody(this);
    });

    return button;
}

function conditionalFlow_buildBody() {
    const ifAnswerWasChildren = $("#if-answer-was-container").children("div");

    if ($(`#if-answer-was-select-0`).length == 0) {
        conditionalFlow_createIfAnswerWas("0");
    } else if (ifAnswerWasChildren.length < $(`#if-answer-was-select-0`).children('option').length) {
        conditionalFlow_createIfAnswerWas(ifAnswerWasChildren.length);
    }
}

function conditionalFlow_createIfAnswerWas(id) {
    const mainDiv = $(`
        <div id="main-div-${id}">
            <label style="font-weight: 700; font-size: 16px; margin-top: 10px">If answer was:</label><br>
            <select id="if-answer-was-select-${id}" style="width: 300px"></select>            
        </div>
    `);

    mainDiv.append(conditionalFlow_createDeleteButton(mainDiv));
    mainDiv.append(conditionalFlow_buildNextFlowOption());

    $('#if-answer-was-container').append(mainDiv);

    conditionalFlow_addEventOnSelectIfAnswerWasSearchQuickRepliesByFlowId(mainDiv.children('select'));
}

function conditionalFlow_createDeleteButton(element) {
    const deleteButton = $('<button style="padding: 0px; width: 20px; height: 20px; margin-left: 10px; margin-top: 6px" class="btn btn-info btn-sm">x</button>');

    deleteButton.on("click", function (event) {
        event.preventDefault();
        element.remove();
    });

    return deleteButton;
}

function conditionalFlow_buildNextFlowOption() {
    const  addNextFlowOptionsButton = $('<button class="btn btn-info btn-sm">+Add Next Flow Condition Options</button>');

    addNextFlowOptionsButton.on('click', function (event) {
        event.preventDefault();

        const quickReplyDiv = $('<div></div>');
        quickReplyDiv.append('<label style="font-weight: 700; font-size: 16px; margin-right: 206px">Quick Reply:</label>');
        quickReplyDiv.append(conditionalFlow_createDeleteButton(quickReplyDiv));

        quickReplyDiv.append($(`
            <select style="width: 300px">${flows_selector_options}</select><br>
            <i class="fas fa-sign-out-alt" style="margin-top: 10px; margin-right: 4px"></i><span style="font-weight: bold"></span><br>
            <label>Button Name: </label><input id="input-button-flow-condition" type="text"></br>
            <label for='show-ckeck-box-flow-condition'>Show Quick Reply Flow Condition Button</label>
            <input class='show-ckeck-box-flow-condition' type='checkbox' style='margin-right: 5px;'>
        `));

        quickReplyDiv.children('select').on('change', function () {
            quickReplyDiv.children('span').html($(this).find(":selected").attr('data-display'));
        });

        $(this).before(quickReplyDiv);
    });


    return addNextFlowOptionsButton;
}

function conditionalFlow_addEventOnSelectIfAnswerWasSearchQuickRepliesByFlowId(ifAnswerWasSelect) {
    const flowId = $("#answer-conditional-select-flow").find(":selected").attr('value');
    if (flowId != "**previous-flow") {
        $.get('/ah/flow/fetch/'+flowId, function(datas) {
            let datasObject = JSON.parse(datas);
            let flow = datasObject.flow_data;
            const answer = flow.answer[0];
            if (answer[answer.length - 1].message.quick_replies) {
                const quick_replies = answer[answer.length - 1].message.quick_replies;
                let option = [];

                for (let q of quick_replies) {
                    option.push(`<option value="${q.title}">${q.title}</option>`);
                }
                //clean
                ifAnswerWasSelect.html('');
                //add
                ifAnswerWasSelect.append(option);
            }
        });
    }
}

//Utils
function isChecked(prop) {
    return prop == "true" ? true : false
}

function buildToggleSwitch(id) {
    return $(`
        <div id="${id}">
            <label class="answer-conditional-add-switch">
                <input id="${id}-internal-input" type="checkbox">
                <span class="answer-conditional-add-slider round"></span>
            </label>
        <div>
    `);
}

/**
 *
 * @param {String} id
 * @param {Array} options
 * @param {String} labelText
 * @returns
 */
function buildSelectWithLabelInColumn(id, options, labelText) {
    return $(`
        <label style="font-weight: 700; font-size: 16px;">${labelText}</label><br>
        <select id="${id}" style="width: 300px">${options}</select><br>        
    `);
}

function buildSpan(id, text) {
    return $(`<i class="fas fa-sign-out-alt">Flow Name:</i><span id="${id}">${text}</span>`);
}

function buildButton(id, text) {
    return $(`<button type="button" class="btn btn-info btn-sm" id="${id}">${text}</button>`);
}

//End the project condition flow
/*TEAM BRAZIL*/


//  Start of structure saved in the project database condition flow
const answerWasSelected = [];
$('#if-answer-was-container').children("div").each(function (index) {
    const answerSelect = $(`#if-answer-was-select-${index} option:selected`);
    if (answerSelect.val().trim() !== '') {
        let arrayPayload = [];
        const chooseConditionals = $(`#main-div-${index}`).children('div');
        chooseConditionals.children('select').each(function () {
            const selectVal = $(this).attr('selected', true).val().trim();

            if (selectVal !== '') {
                arrayPayload.push(selectVal);
            }
        });

        let arrayTitle = [];
        const div = $(`#main-div-${index}`).children('div').children('#input-button-flow-condition');
        div.each(function (index, element) {
            const buttonAnswer = $(element).val();
            if (buttonAnswer.trim() !== '') {

                arrayTitle.push(buttonAnswer);

            }
        });

        let arrayShowQrButton = [];
        const divShowButton = $(`#main-div-${index}`).children('div').children('.show-ckeck-box-flow-condition');
        divShowButton.each(function () {
            const showbutton = $(this).is(":checked");
            arrayShowQrButton.push(showbutton);
        });

        const wasText = {
            text: answerSelect.val().trim(),
            quick_replies_flow_condition: []
        };
        if (arrayPayload.length != 0 && arrayTitle.length != 0) {
            for (let i = 0; i < arrayPayload.length; i++) {
                wasText.quick_replies_flow_condition.push({
                    payload: arrayPayload[i],
                    title: arrayTitle[i],
                    show_qr_button: arrayShowQrButton[i]
                });
            }
        }
        answerWasSelected.push(wasText);
    }
});

if (answerWasSelected[0]?.quick_replies_flow_condition?.length > 0) {
    const struct_to_save = {
        toggleSwitch:  $("#answer-conditional-toggle-switch").children('label').children('input').is(":checked"),
        conditionalFlowSelected: $("#answer-conditional-select-flow").val(),
        answers: answerWasSelected
    };
    form_data['flowConditional'] = struct_to_save;
}
//  End of structure saved in the project database condition flow
//TEAM BRAZIL