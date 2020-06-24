// Check if first time typing
let firstInput = true
// To check if decimal can be places
let decimalAllowed = true 
// Track how many brackets have been opened
let openedBrackets = 0 
// Error message for division by zero
const errorMessage = "I'm sorry Dave"
// Create a list of sign operators for use in function comparisons
const signOperators = [...document.querySelectorAll(".signOperator")].map(signOperator => signOperator.value)
// Create a list of operator for use in function comparisons 
const operators = [...document.querySelectorAll(".operator")].map(operator => operator.value)

let outputID = document.getElementById("displayOutput") // Output handle
outputID.textContent = "0"

// Click event handler for numeric operands 0-9
let operandContainer = document.querySelectorAll(".operand")
operandContainer.forEach(operand => {
	operand.addEventListener('click', e => appendOperand(e.target.value), false)
})

// Click event handler for sign operators "+", "-", "*", "/"
let signOperatorContainer = document.querySelectorAll(".signOperator")
signOperatorContainer.forEach(signOperator => {
	signOperator.addEventListener('click', e => appendSignOperator(e.target.value), false)
})

// Click event handler called for operators "(", ")", "Back", and "Clear"
let operatorContainer = document.querySelectorAll(".operator")
	operatorContainer.forEach(operator => {
		operator.addEventListener('click', e => appendOperator(e.target.value), false) 
})

// Keyboard event handler for numeric operands 0-9
window.addEventListener('keydown', checkKey, false)

function checkKey(e) {

	let key = e.key
	
	let keyRegex = /^[0-9\.\*\/\-\+x\=c]|Enter|Backspace|Delete/i;
	if(keyRegex.test(key)) {
		console.log(key)
		if (key == 'Enter' || key == '=' || key == "+" || key == "-" || key == "*" || key == "/") {
			if(key == 'Enter') key = "="
			if(key == "*" || key == "x") key = "x"
			console.log("appendSignOperator")
			appendSignOperator(key)
		}
		else if (key == 'c' || key == "Backspace" || key == "Delete") {
			
			if(key == 'c') key = "Clear"
			if(key == "Backspace" || key == "Delete") key = "Back"
			console.log("appendOperator")
			appendOperator(key)
		}
		else {
			console.log("appendOperand")
			appendOperand(key)
		}
		

	}
}

function appendOperand(e) {
	let operand = e

	if (outputID.textContent == "") {
		outputID.textContent = "0"
		firstInput = true
	}
	if (operand == "." && !decimalAllowed) return
	if (operand == "0" && firstInput) return

	if(matchPreviousCharacters(-1, "0") && 
		matchPreviousCharacters(-2, signOperators, "", false)) {
			if (operand == "0") return
			if (operand == ".") {
				decimalAllowed = false
				outputID.textContent += operand
			}
			else {
				outputID.textContent = outputID.textContent.slice(0, -1)
				outputID.textContent += operand
				
			}
	} 
	else {
		if (operand == ".") decimalAllowed = false
		if (firstInput) outputID.textContent = operand
		else {
			outputID.textContent += operand
		}
	}
	
	firstInput = false 
	this.blur(); // Removes focus from buttons
}

function appendSignOperator(e){
let operator = e

switch (operator) {
	case "=":
		// Get expression as string from output text box
		const exp = outputID.textContent
		// Calc value based off string
		let expCalc = operate(exp)
		// Round value to 3 decimal places if needed
		let expCalcRounded = roundToN(expCalc, 3)

		// If rounding truncates decimal value to zero (hence removing decimal) e.g. 0.00002 x 2 = 0, then allow decimals to be used again. 
		if (!Number.isInteger(expCalc) && 
			Number.isInteger(expCalcRounded)) {
				decimalAllowed = true
			}

		// If divided by zero, send message to user
		if (!isFinite(expCalcRounded)) {
			outputID.textContent = errorMessage
			firstInput = true
			return
		}
								
		//If zero, treat result as first input
		if (expCalcRounded == "0") firstInput = true

		outputID.textContent = expCalcRounded
		return

	case "-":
		// Allow minus sign to function as negative sign if last characters are not already sign operators
		// console.log()
		if(matchPreviousCharacters(-2, signOperators) ||
			matchPreviousCharacters(-1, "-")) {
			return
		}
		if (firstInput) outputID.textContent = operator
		else outputID.textContent += operator
		break 

	default:
		// If previous character is open bracket or sign operator, then do not accept sign input. Prevents scenarios such as 27(*5) and 8*/2
		if (matchPreviousCharacters(-1, "(", signOperators) || 
			(firstInput && outputID.textContent == errorMessage)) {
			return
		}
		outputID.textContent += operator
		break
	}

	firstInput = false
	decimalAllowed = true
	this.blur(); // Removes focus from buttons
}

	
function appendOperator(e) {
let operator = e

switch (operator) {
	case "Back":
		// If back, remove last element from output. Keeps track of opened brackets if there are any.
		if (matchPreviousCharacters(-1, ")")) openedBrackets++
		if (matchPreviousCharacters(-1, "(")) openedBrackets--
		if (matchPreviousCharacters(-1, ".")) decimalAllowed = true
		outputID.textContent = outputID.textContent.slice(0, -1)
		break

	case "Clear":
		// If clear, erase display and allow decimals to be used
		outputID.textContent = "0"
		firstInput = true
		decimalAllowed = true
		openedBrackets = 0
		return

	case "(":
		// If open bracket, increment bracket counter
		if (firstInput) outputID.textContent = operator
		else outputID.textContent += operator
		openedBrackets++
		break

	case ")":
		// If close bracket, make sure open bracket, sign operator or open bracket/decimal does not immediately preceed it. Avoids scenarios like "()", "45+(2+)", and "(.)"
		if (!openedBrackets || matchPreviousCharacters(-1, "(", signOperators) || 
			matchPreviousCharacters(-2, "(", ".")) {
			return
		}                 
		outputID.textContent += operator
		openedBrackets--
		break

	default:
		break
}

firstInput = false
this.blur(); // Removes focus from buttons
}



// Pass arithmetic expression as string to calc result. Using Regex to find/replace necessary terms. Could have used event handler logic, but wanted to practice some Regex black magic
function operate(str) {
	// Finds and replaces "x" multiply symbol with "*"
	const regexMultiplySign = /x/g 
	// Finds opening brackets preceded by a numeric or decimal in order to replace with "*(" e.g. 56(10) -> 56*(10)
	const regexOpeningBracket = /(?<=[0-9\.\)])\(/g
	// Finds closing brackets succeeded by a numeric or decimal in order to replace with ")*" e.g. (10).1 -> (10)*.1
	const regexClosingBracket = /\)(?=[0-9\.\(])/g
	
	// Replace necessary "x", "(", ")" symbols with "*", "*(", ")*" symbols respectivly
	const strRegex = str
				.replace(regexMultiplySign, '*')
				.replace(regexOpeningBracket, '*(')
				.replace(regexClosingBracket, ')*')

	// Evaulate arithmetic string and return value
	return Function(`'use strict'; return (${strRegex})`)()
}

// Checks if value is float
function isFloat(n) {
	return n % 1 ? true : false
}

// Rounds num to n decimal places only if needed. e.g. 4/2=2 2/4=0.5, 5/3=1.667
function roundToN(num, n) {
	return (Math.round(num * 10**n) / 10**n)
}

// Checks n previous characters to see if they contain itemToMatch1 and itemToMatch2. Possible to only supply itemToMatch1 parameter. Will return true if all provided items locate
function matchPreviousCharacters(n, itemToMatch1, itemToMatch2 = "", every = true) {
	if (n >= 0) return false
	let itemsToMatch = [...itemToMatch1, ...itemToMatch2]
	let lastNCharacters = outputID.textContent
							.slice(n)
							.split('')
							
	// console.log(itemsToMatch)
	// console.log(lastNCharacters)
	if (every) return lastNCharacters.every(elem => itemsToMatch.indexOf(elem) > -1)
	else return lastNCharacters.some(elem => itemsToMatch.indexOf(elem) > -1)
}