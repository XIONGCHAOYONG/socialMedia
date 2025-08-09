package com.x.service.impl;

import com.x.mapper.*;
import com.x.pojo.dto.PostCommentDTO;
import com.x.pojo.dto.PostDTO;
import com.x.pojo.dto.PostLikeDTO;
import com.x.pojo.dto.SendPostDTO;
import com.x.pojo.entity.Post;
import com.x.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostServiceImpl implements PostService {
    @Autowired
    private PostMapper postMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private PostLikeMapper postLikeMapper;
    @Autowired
    private PostCommentMapper postCommentMapper;
    @Autowired
    private FriendMapper friendMapper;

    @Override
    public List<PostDTO> getPosts(Long userId) {
        //根据userId获得好友的id
        List<Long> friendIds = friendMapper.getFriendIds(userId);
        //把自己的id也加进去
        friendIds.add(userId);
        if(friendIds.size()==0)
            return null;
        List<PostDTO> posts= postMapper.getFriendPosts(friendIds);

        //获取所有动态的id
        List<Long> postIds = posts.stream().map(PostDTO::getId).toList();
        if(postIds.size()==0)
            return null;
        List<PostCommentDTO> comments = postMapper.getCommentsByPostIds(postIds);
        List<PostLikeDTO> likes = postMapper.getLikesByPostIds(postIds);
        for (PostDTO post : posts) {
            post.setComments(comments.stream().filter(comment -> comment.getPostId().equals(post.getId())).toList());
            post.setLikes(likes.stream().filter(like -> like.getPostId().equals(post.getId())).toList());
        }
        return posts;
    }

    @Override
    public void sendPost(SendPostDTO sendPostDTO) {
        postMapper.sendPost(sendPostDTO);
    }

    @Override
    public void deletePost(Long id) {
        postMapper.deletePost(id);
    }

    @Override
    public List<PostDTO> getAllPosts() {
        List<PostDTO> posts= postMapper.getAllPosts();

        //获取所有动态的id
        List<PostCommentDTO> comments = postMapper.getAllComments();
        List<PostLikeDTO> likes = postMapper.getAllLikes();
        for (PostDTO post : posts) {
            post.setComments(comments.stream().filter(comment -> comment.getPostId().equals(post.getId())).toList());
            post.setLikes(likes.stream().filter(like -> like.getPostId().equals(post.getId())).toList());
        }
        return posts;
    }

    @Override
    public List<PostDTO> getMomentsListById(Long friendId) {
        List<PostDTO> posts= postMapper.getPostsById(friendId);

        //获取所有动态的id
        List<Long> postIds = posts.stream().map(PostDTO::getId).toList();
        List<PostCommentDTO> comments = postMapper.getCommentsByPostIds(postIds);
        List<PostLikeDTO> likes = postMapper.getLikesByPostIds(postIds);
        for (PostDTO post : posts) {
            post.setComments(comments.stream().filter(comment -> comment.getPostId().equals(post.getId())).toList());
            post.setLikes(likes.stream().filter(like -> like.getPostId().equals(post.getId())).toList());
        }
        return posts;
    }
}
