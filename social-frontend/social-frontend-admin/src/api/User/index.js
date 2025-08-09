import request from "@/utils/request";

function login(data) {
  return request({
    url: '/admin/user/login',
    method: 'post',
    data
  })
}

function get() {
  return request({
    url: '/admin/user/get',
    method: 'get'
  })
}

function block(id) {
  return request({
    method: 'delete',
    url: `/admin/user/block/${id}`
  })
}

function recover(id) {
  return request({
    method: 'put',
    url: `/admin/user/recover/${id}`
  })
}

function setAdmin(id) {
  return request({
    method: 'put',
    url: `/admin/user/setAdmin/${id}`
  })
}

export default { get, login, block, recover, setAdmin }