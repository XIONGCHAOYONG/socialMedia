import request from "@/utils/request";

function getAllTags() {
  return request({
    url: '/admin/tag/get',
    method: 'get'
  })
}

function addTag(tag) {
  return request({
    url: '/admin/tag/add',
    method: 'post',
    data: tag
  })
}

function deleteById(id) {
  return request({
    url: `/admin/tag/delete/${id}`,
    method: 'delete'
  })
}

function updateById(id) {
  return request({
    url: `/admin/tag/update/${id}`,
    method: 'get'
  })
}
export default {
  getAllTags,
  addTag,
  deleteById,
  updateById
}