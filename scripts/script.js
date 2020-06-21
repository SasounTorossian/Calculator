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


let operandFunc = function(e) {
	let operand

	if(e.type == 'keydown' && isFinite(parseInt(e.key))) operand = e.key
	else if(e.type == 'keydown' && e.key == '.') operand = e.key
	else if (e.type == 'click') operand = e.target.value
	else return

	if (operand == "." && !decimalAllowed) {
		inavlidInput()
		return
	}
	// if (operand == "0" && matchPreviousCharacters(-1, "0") && decimalAllowed) {
	//     inavlidInput()
	//     return
	// }
	if (operand == ".") decimalAllowed = false
	if (firstInput) outputID.textContent = operand
	else outputID.textContent += operand

	firstInput = false 
	this.blur(); // Removes focus from buttons
}

// Click event handler for numeric operands 0-9
let operandContainer = document.querySelectorAll(".operand")
operandContainer.forEach(operand => {
	operand.addEventListener('click', operandFunc, false)
})

// Keyboard event handler for numeric operands 0-9
window.addEventListener('keydown', operandFunc, false)


let signOperatorFunc = function(e) {
	let operator
	
	if(e.type == 'keydown' && signOperators.indexOf(e.key) > -1) operator = e.key
	else if (e.type == 'keydown' && e.key == '*') operator = "x"
	else if (e.type == 'keydown' && e.key == 'Enter') operator = "="
	else if (e.type == 'click') operator = e.target.value
	else return

	switch (operator) {
		case "=":
			// Get expression as string from output text box
			const exp = outputID.textContent
			// Calc value based off string
			let expCalc = operate(exp)
			// Round value to 3 decimal places if needed
			expCalc = roundToN(expCalc, 3)

			// If divided by zero, send message to user
			if (!isFinite(expCalc)) {
				outputID.textContent = errorMessage
				firstInput = true
				return
			}
									
			//If zero, treat result as first input
			if (expCalc == "0") firstInput = true

			outputID.textContent = expCalc
			return

		case "-":
			// Allow minus sign to function as negative sign if last characters are not already sign operators
			// console.log()
			if(matchPreviousCharacters(-2, signOperators) ||
				matchPreviousCharacters(-1, "-")) {
				inavlidInput()
				return
			}
			if (firstInput) outputID.textContent = operator
			else outputID.textContent += operator
			break 

		default:
			// If previous character is open bracket or sign operator, then do not accept sign input. Prevents scenarios such as 27(*5) and 8*/2
			if (matchPreviousCharacters(-1, "(", signOperators) || 
				(firstInput && outputID.textContent == errorMessage)) {
				inavlidInput()
				return
			}
			outputID.textContent += operator
			break
		}

		firstInput = false
		decimalAllowed = true
		this.blur(); // Removes focus from buttons
	}

// Click event handler for sign operators "+", "-", "*", "/"
let signOperatorContainer = document.querySelectorAll(".signOperator")
signOperatorContainer.forEach(signOperator => {
	signOperator.addEventListener('click', signOperatorFunc, false)
})

// Keyboard event handler for sign operators "+", "-", "*", "/"
window.addEventListener('keydown', signOperatorFunc, false)


let operatorFunc = function(e) {
	let operator

	if(e.type == 'keydown' && operators.indexOf(e.key) > -1) operator = e.key
	else if(e.type == 'keydown' && (e.key == 'c' || e.key == 'C')) operator = "Clear"
	else if(e.type == 'keydown' && e.key == "Backspace") operator = "Back"
	else if (e.type == 'click') operator = e.target.value
	else return

	switch (operator) {
		case "Back":
			// If back, remove last element from output. Keeps track of opened brackets if there are any.
			if (matchPreviousCharacters(-1, ")")) openedBrackets++
			if (matchPreviousCharacters(-1, "(")) openedBrackets--
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
				inavlidInput()
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

// Click event handler called for operators "(", ")", "Back", and "Clear"
let operatorContainer = document.querySelectorAll(".operator")
	operatorContainer.forEach(operator => {
		operator.addEventListener('click', operatorFunc, false) 
	})

// Keyboard event handler called for operators "(", ")", "Back", and "Clear"
window.addEventListener('keydown', operatorFunc, false)

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
function matchPreviousCharacters(n, itemToMatch1, itemToMatch2 = "") {
	if (n >= 0) return false
	let itemsToMatch = [...itemToMatch1, ...itemToMatch2]
	let lastNCharacters = outputID.textContent
							.slice(n)
							.split('')
							
	return lastNCharacters.every(elem => itemsToMatch.indexOf(elem) > -1)
}