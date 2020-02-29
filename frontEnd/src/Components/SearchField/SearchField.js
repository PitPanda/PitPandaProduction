import React, { Component, Fragment } from "react";
import MinecraftText from '../Minecraft/MinecraftText';
import './SearchField.css';

class Autocomplete extends Component {

    state = {
        // The active selection's index
        activeSuggestion: 0,
        // The suggestions that match the user's input
        filteredSuggestions: [],
        // Whether or not the suggestion list is shown
        showSuggestions: false,
        // What the user has entered
        userInput: this.props.says,
        reporting: this.props.says,
        userNumber: "",
        showNumber:false
    };

    static getDerivedStateFromProps(props,state){
        return {
            activeSuggestion:state.activeSuggestion,
            filteredSuggestions:state.filteredSuggestions,
            showSuggestions:state.showSuggestions,
            userInput:props.says,
            reporting:state.reporting,
            userNumber: state.userNumber,
            showNumber:state.showNumber
        }
    }

    numRef = React.createRef();

    // Event fired when the input value is changed
    onChange = e => {
        const { suggestions } = this.props;
        const userInput = e.currentTarget.value;

        // Filter our suggestions that don't contain the user's input
        const filteredSuggestions = suggestions.filter(
            suggestion =>
                suggestion[1].Name.replace(/§./g,'').toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );

        // Update the user input and filtered suggestions, reset the active
        // suggestion and make sure the suggestions are shown
        const reporting=e.currentTarget.value;
        const showNumber = Boolean(this.props.suggestions.find(s=>s[0]===reporting&&!s[1].NoNumber))
        this.setState({
            activeSuggestion: 0,
            filteredSuggestions,
            showSuggestions: true,
            userInput: e.currentTarget.value,
            reporting,
            showNumber
        });
        this.reportString(reporting,showNumber,this.state.userNumber,e.currentTarget.value);
    };

    reportString(value,showNumber,number,text){
        if(text==='') return this.props.report('', '', 'resource');
        value=value.toLowerCase();
        number=number.toLowerCase();
        let type = 'resource';
        let match = this.props.suggestions.find(s=>value===s[0]);
        if(!match){
            match = this.props.suggestions.find(s=>s[1].Name.replace(/§./g,'').toLowerCase() === value);
            if(!match) match = this.props.suggestions.find(s=>s[1].Name.replace(/§./g,'').toLowerCase().indexOf(value) > -1);
            if(match) {
                if(!showNumber&&!match[1].NoNumber){
                    showNumber=true;
                    number='0+';
                }
                if(match[1].Name.replace(/§./g,'').toLowerCase()===value) {
                    type=match[1].Type;
                    this.setState({showNumber:!match[1].NoNumber});
                }
                value  = match[0];
            }
        }else{
            type=match[1].Type;
        }
        if(value==='color'){
            const colors = this.props.suggestions.find(s=>s[0]==='color');
            if(colors&&typeof colors[1].Colors[number] !== 'undefined') number=colors[1].Colors[number];
        }
        if(typeof number === 'undefined' || number==='') number = '0+';
        if(number.startsWith('<')) number=number.substring(1)+'-';
        if(number.startsWith('>')) number=number.substring(1)+'+';
        this.props.report(value+(showNumber?number:''), text, type);
    }

    onNumberChange = e => {
        this.setState({userNumber:e.currentTarget.value});
        this.reportString(this.state.reporting,true,e.currentTarget.value,this.state.userInput);
    }

    onClick = e => {
        this.select(e.currentTarget.getAttribute('index'));
    };  

    select = index => {
        const reporting = this.state.filteredSuggestions[index][0];
        const showNumber = Boolean(this.props.suggestions.find(s=>s[0]===reporting&&!s[1].NoNumber));
        if(showNumber) this.numRef.current.focus();
        const userInput = this.state.filteredSuggestions[index][1].Name.replace(/§./g,'')
        this.setState({
            activeSuggestion: 0,
            filteredSuggestions:[],
            showSuggestions: false,
            showNumber,
            reporting,
            userNumber:'',
            userInput
        });
        this.reportString(reporting,showNumber,this.state.userNumber,userInput, this.state.filteredSuggestions[index][1].Type);
    }

    onKeyDown = e => {
        const { activeSuggestion, filteredSuggestions, showSuggestions } = this.state;
        if(showSuggestions && filteredSuggestions.length && filteredSuggestions.length !== this.props.suggestions.length){
            if (e.keyCode === 13) {
                if(filteredSuggestions[activeSuggestion]){
                    this.select(activeSuggestion);
                }else{
                    const reporting = e.currentTarget.value;
                    this.setState({
                        activeSuggestion: 0,
                        showSuggestions: false,
                        userInput: e.currentTarget.value,
                        showNumber: Boolean(this.props.suggestions.find(s=>s[0]===reporting&&!s[1].NoNumber)),
                        reporting
                    });
                    this.reportString(reporting,this.state.showNumber,this.state.userNumber,e.currentTarget.value);
                }
            }
            // User pressed the up arrow, decrement the index
            else if (e.keyCode === 38) {
                if (activeSuggestion === 0) {
                    return;
                }
    
                this.setState({ activeSuggestion: activeSuggestion - 1 });
            }
            // User pressed the down arrow, increment the index
            else if (e.keyCode === 40) {
                if (activeSuggestion - 1 === filteredSuggestions.length) {
                    return;
                }
    
                this.setState({ activeSuggestion: activeSuggestion + 1 });
            }
        }else{
            if (e.keyCode === 8 && e.currentTarget.value==='') return this.props.kill();
            else if (e.keyCode===38) this.props.up();
            else if (e.keyCode===40) this.props.down();
            else if (e.keyCode===13) {
                if(this.state.showNumber) this.numRef.current.focus();
                else this.props.down();
            }
        }
    };

    onKeyDownNumber = e => {
        if (e.keyCode === 8 && e.currentTarget.value==='') this.props.mainRef.current.focus();
        else if (e.keyCode===38) this.props.up();
        else if (e.keyCode===40||e.keyCode===13) this.props.down();
    }

    onBlur = e => {
        this.props.timeOutFix(setTimeout(()=>this.setState({ showSuggestions: false }),150));
    }

    render() {
        const {
            onChange,
            onNumberChange,
            onClick,
            onKeyDown,
            numRef,
            onBlur,
            onKeyDownNumber,
            state: {
                activeSuggestion,
                filteredSuggestions,
                showSuggestions,
                showNumber,
                userInput,
                userNumber
            }
        } = this;

        let suggestionsListComponent;

        const tabIndex = {};
        if(!showNumber) tabIndex.tabIndex=-1;

        if (showSuggestions && userInput) {
            if(filteredSuggestions.length){
                suggestionsListComponent = (
                    <ul className={`suggestions ${showNumber?'SuggestionsHalf':''}`}>
                        {filteredSuggestions.slice(0,8).map((suggestion, index) => {
                            let className;
    
                            // Flag the active suggestion with a class
                            if (index === activeSuggestion) {
                                className = "suggestion-active";
                            }
    
                            return (
                                <li
                                    className={className}
                                    key={suggestion[0]}
                                    onClick={onClick}
                                    index={index}
                                    >
                                    <MinecraftText raw={suggestion[1].Name}/>
                                </li>
                            );
                        })}
                    </ul>
                );
            }
        }

        return (
            <Fragment>
                <input
                    type="text"
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    value={userInput}
                    onBlur={onBlur}
                    ref={this.props.mainRef}
                    className={`SearchField ${showNumber?'Half':''}`}
                />
                <input
                    type="text"
                    onChange={onNumberChange}
                    onKeyDown={onKeyDownNumber}
                    value={userNumber}
                    className={`SearchField NumberField ${showNumber?'':'HideField'}`}
                    ref={numRef}
                    {...tabIndex}
                />
                {suggestionsListComponent}
            </Fragment>
        );
    }
}

export default Autocomplete;