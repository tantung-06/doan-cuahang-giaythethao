function toggleAddressForm() {
    const savedAddress = document.getElementById('saved-address');
    const savedAddressInfo = document.getElementById('saved-address-info');
    const newAddressForm = document.getElementById('new-address-form');
    
    if (savedAddress.checked) {
        savedAddressInfo.style.display = 'block';
        newAddressForm.style.display = 'none';
    } else {
        savedAddressInfo.style.display = 'none';
        newAddressForm.style.display = 'block';
    }
}