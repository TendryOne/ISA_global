export default (e :  Event, BlockNumber : number) => {
  const target = e.target as HTMLInputElement
  if(target.value.length >= BlockNumber){
    e.preventDefault();
  }

}
