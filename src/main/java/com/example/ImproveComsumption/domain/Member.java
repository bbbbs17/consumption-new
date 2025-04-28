package com.example.ImproveComsumption.domain;


import com.example.ImproveComsumption.model.Consumption;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@RequiredArgsConstructor
@Entity
@Table(name = "members")
public class Member {


    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role =Role.USER;

    @Column(length = 50)
    private String provider;

    @Column(length = 100, unique = true)
    private String providerId;

    @CreationTimestamp
    private LocalDateTime localDateTime;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Consumption> consumptions = new ArrayList<>();


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OAuthType oAuthType = OAuthType.NONE;






}
