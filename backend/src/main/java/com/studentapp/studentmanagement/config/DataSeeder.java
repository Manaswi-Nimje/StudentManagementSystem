package com.studentapp.studentmanagement.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentapp.studentmanagement.entity.Role;
import com.studentapp.studentmanagement.entity.Student;
import com.studentapp.studentmanagement.entity.User;
import com.studentapp.studentmanagement.repository.StudentRepository;
import com.studentapp.studentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

/**
 * Runs once on every application startup and makes sure the app is usable
 * the moment it's deployed — no manual data entry required:
 *   1. Seeds a demo staff account so the login/register pages aren't a
 *      dead end for a fresh deployment.
 *   2. Loads a starter set of student records from
 *      resources/data/students-seed.json into the database.
 *
 * Both steps are idempotent (guarded by count() checks), so this is safe to
 * leave in for the life of the app — it never overwrites real data once any
 * exists.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    // Demo credentials — clearly marked as such wherever they're shown in
    // the UI. Change or remove this account before using the app for real.
    private static final String DEMO_USERNAME = "demo_registrar";
    private static final String DEMO_EMAIL = "demo@gradebook.app";
    private static final String DEMO_PASSWORD = "Demo@1234";

    @Override
    public void run(String... args) throws Exception {
        seedDemoUser();
        seedStudents();
    }

    private void seedDemoUser() {
        if (userRepository.existsByUsername(DEMO_USERNAME)) {
            return;
        }
        User demo = new User();
        demo.setFullName("Demo Registrar");
        demo.setUsername(DEMO_USERNAME);
        demo.setEmail(DEMO_EMAIL);
        demo.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
        demo.setRole(Role.ADMIN);
        userRepository.save(demo);
        log.info("Seeded demo login -> username: {}, password: {}", DEMO_USERNAME, DEMO_PASSWORD);
    }

    private void seedStudents() {
        if (studentRepository.count() > 0) {
            return;
        }
        try (InputStream in = new ClassPathResource("data/students-seed.json").getInputStream()) {
            ObjectMapper mapper = new ObjectMapper();
            mapper.findAndRegisterModules();
            List<Student> seedStudents = mapper.readValue(in, mapper.getTypeFactory()
                    .constructCollectionType(List.class, Student.class));
            studentRepository.saveAll(seedStudents);
            log.info("Seeded {} starter student records.", seedStudents.size());
        } catch (Exception e) {
            log.warn("Could not seed starter student records: {}", e.getMessage());
        }
    }
}
