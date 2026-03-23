// Import des boutons éditables
import { EditableButton } from "./modelEditableButton.js";

/**
 * Classe Calculator.
 * (Modèle représentant la calculatrice)
 */
export class Calculator {
  /**
   * Expression actuelle de la calculatrice.
   * @type {string}
   */
  #input;

  /**
   * Mémoire de la calculatrice.
   * @type {{string|null}}
   */
  #memory;

  /**
   * Objet littéral contenant les boutons éditables de la calculatrice.
   * (Clé = ID du bouton, Valeur = Objet EditableButton associé)
   * @type {Object}
   */
  #editableButtons;

  /**
   * Constructeur de la classe Calculator.
   * @param {Object} editableBtns : Informations sur les boutons éditables.
   */
  constructor(editableBtns) {
    this.#input = "";
    this.#memory = null;

    // Initialisation des boutons éditables
    // (avec un ID qui commence par "libre" suivi d'un chiffre)
    this.#editableButtons = {};
    for (let key in editableBtns) {
      let btn = new EditableButton(key, editableBtns[key]);
      this.#editableButtons[key] = btn;
    }
  }

  /**
   * Retourne l'expression actuelle de la calculatrice.
   * @returns {string}
   */
  getInput() {
    return this.#input;
  }

  /**
   * Met à jour l'expression actuelle de la calculatrice.
   * @param {string} expr : Nouvelle expression
   */
  setInput(expr) {
    this.#input = expr;
  }

  /**
   * Vide l'entrée de la calculatrice.
   */
  clearInput() {
    this.#input = "";
  }

  /**
   * Retourne la liste des IDs des boutons éditables.
   * @returns {Array} La liste des IDs des boutons éditables (une liste de chaînes de caractères).
   */
  getIdsEditablesButtons() {
    return Object.keys(this.#editableButtons);
  }

  /**
   * Retourne la valeur d'un bouton éditable.
   * @param {string} idBtn : ID du bouton éditable.
   * @returns {string} La valeur du bouton éditable (ou null, si le bouton n'existe pas).
   */
  getValueEditableButton(idBtn) {
    if (this.#editableButtons[idBtn]) {
      return this.#editableButtons[idBtn].getValue();
    } else {
      return null;
    }
  }

  retourArriere(){
    if (this.#input.length > 0){
      this.#input = this.#input.slice(0, this.#input.length - 1);
    }
    
  }

  addToInputValue(value){
    this.#input += value;
  }

  reverseTheSign(){
    if(this.#input.length > 0){
      if(this.#input.charAt(0) === "-"){
        this.#input = this.#input.slice(1, this.#input.length);
      } else {
        this.#input = "-" + this.#input;
      }
    }
  }

  calcul(){
    const result = eval(this.#input);
    this.setInput(result.toString());
  }

  clearMemory(){
    this.#memory = "";

    localStorage.setItem("memoryContent", "");

    this.saveStateToClient();
  }

  recallMemory(){
    this.#input = this.#input + this.#memory;
  }

  setMemory(){

    if(this.#input == ""){

    } else {

      this.#memory = this.#input;
    }
    
  }

  saveStateToClient(){

    // gérer mémoire calc
    
    if(this.#memory == null){
      localStorage.setItem("memoryContent","");
    } else {
      localStorage.setItem("memoryContent", this.#memory);
    }
    
    // gérer les boutons modifiables

    let objEditables = {};

    for (let id in this.#editableButtons){
      objEditables[id] = this.getValueEditableButton(id);
    }

  localStorage.setItem("editableButtonsContent", JSON.stringify(objEditables));

  }

  retrieveStateFromClient(){

    this.#memory = localStorage.getItem("memoryContent");

    let data = localStorage.getItem("editableButtonsContent");

    if(data){
      let obj = JSON.parse(data);

      for(let id in obj){
        if(this.#editableButtons[id]){
          this.#editableButtons[id].setValue(obj[id]);
        }
      }
    }
  }
}
