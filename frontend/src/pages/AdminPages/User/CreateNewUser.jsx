import React from 'react'
import MenuBarUser from '../../../components/Navigation/MenuBarUser'
import CreateUserForm from '../../../components/AdminComponents/CreateUserForm'
export default function CreateNewUser() {
    return (
        <div>
            <MenuBarUser />
            <CreateUserForm />
        </div>
    )
}
