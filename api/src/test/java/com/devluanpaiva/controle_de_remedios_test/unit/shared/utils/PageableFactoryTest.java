package com.devluanpaiva.controle_de_remedios_test.unit.shared.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

@DisplayName("PageableFactory")
class PageableFactoryTest {

    private void assertInvalidPagination(ThrowingCallable callable, String expectedField) {
        assertThatThrownBy(callable)
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(businessException.getCode()).isEqualTo("INVALID_PAGINATION");
                    assertThat(businessException.getField()).isEqualTo(expectedField);
                });
    }

    @Nested
    @DisplayName("build")
    class Build {

        @Test
        @DisplayName("should build a Pageable with the given page and size")
        void shouldBuildPageableWithGivenPageAndSize() {
            Pageable pageable = PageableFactory.build(0, 20);

            assertThat(pageable.getPageNumber()).isEqualTo(0);
            assertThat(pageable.getPageSize()).isEqualTo(20);
        }

        @Test
        @DisplayName("should build a Pageable for a non-zero page")
        void shouldBuildPageableForNonZeroPage() {
            Pageable pageable = PageableFactory.build(3, 50);

            assertThat(pageable.getPageNumber()).isEqualTo(3);
            assertThat(pageable.getPageSize()).isEqualTo(50);
        }

        @Test
        @DisplayName("should accept the minimum allowed size (1)")
        void shouldAcceptMinimumAllowedSize() {
            Pageable pageable = PageableFactory.build(0, 1);

            assertThat(pageable.getPageSize()).isEqualTo(1);
        }

        @Test
        @DisplayName("should accept the maximum allowed size (100)")
        void shouldAcceptMaximumAllowedSize() {
            Pageable pageable = PageableFactory.build(0, 100);

            assertThat(pageable.getPageSize()).isEqualTo(100);
        }

        @Test
        @DisplayName("should accept an arbitrarily large page number, since only size is capped")
        void shouldAcceptArbitrarilyLargePageNumber() {
            Pageable pageable = PageableFactory.build(Integer.MAX_VALUE, 20);

            assertThat(pageable.getPageNumber()).isEqualTo(Integer.MAX_VALUE);
        }

        @Test
        @DisplayName("should reject a negative page")
        void shouldRejectNegativePage() {
            assertInvalidPagination(() -> PageableFactory.build(-1, 20), "page");
        }

        @ParameterizedTest(name = "should reject size={0}")
        @ValueSource(ints = { 0, -5, 101, Integer.MAX_VALUE })
        @DisplayName("should reject a size outside the [1, 100] range")
        void shouldRejectSizeOutsideAllowedRange(int size) {
            assertInvalidPagination(() -> PageableFactory.build(0, size), "size");
        }

        @Test
        @DisplayName("should report the page violation before the size violation when both are invalid")
        void shouldReportPageViolationBeforeSizeViolation() {
            assertInvalidPagination(() -> PageableFactory.build(-1, 0), "page");
        }

        @Test
        @DisplayName("should build a Pageable with unsorted order when no sort is given")
        void shouldBuildPageableUnsortedByDefault() {
            Pageable pageable = PageableFactory.build(0, 20);

            assertThat(pageable.getSort().isUnsorted()).isTrue();
        }

        @Test
        @DisplayName("should build a Pageable with the given sort")
        void shouldBuildPageableWithGivenSort() {
            Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
            Pageable pageable = PageableFactory.build(0, 20, sort);

            assertThat(pageable.getSort()).isEqualTo(sort);
        }

        @Test
        @DisplayName("should still validate page and size when a sort is given")
        void shouldValidatePageAndSizeWithSort() {
            Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");

            assertInvalidPagination(() -> PageableFactory.build(-1, 20, sort), "page");
        }
    }
}
