
class EnhancedClassroomManager {
    constructor() {
        this.students = [];
        this.seats = [];
        this.savedArrangements = [];
        this.init();
    }

    init() {
        // 학생 목록 초기화
        for (let i = 1; i <= 24; i++) {
            this.students.push(`학생 ${i}`);
        }

        // 자리 초기화
        this.seats = Array.from(document.querySelectorAll('.seat'));
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 초기 자리 배치
        this.assignInitialSeats();
        
        // 저장된 배치 불러오기
        this.loadSavedArrangements();
        
        // 환영 메시지
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        // 버튼 이벤트
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shuffleSeats());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSeats());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveArrangement());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadArrangement());
        document.getElementById('manageStudentsBtn').addEventListener('click', () => this.openStudentManagementModal());
        
        // 자리 클릭 이벤트
        this.seats.forEach(seat => {
            seat.addEventListener('click', () => this.handleSeatClick(seat));
        });

        // 학생 클릭 이벤트 (드래그 앤 드롭 시뮬레이션)
        document.querySelectorAll('.student').forEach(student => {
            student.addEventListener('click', () => this.handleStudentClick(student));
        });

        // 학생 명단 관리 모달 이벤트
        this.setupStudentManagementEvents();
    }

    // 환영 메시지
    showWelcomeMessage() {
        Swal.fire({
            title: '🎓 학급 자리 배치 시스템',
            html: `
                <div class="text-start">
                    <h5>기능 안내:</h5>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-random text-success me-2"></i>자리 섞기: 무작위로 자리를 배치합니다</li>
                        <li><i class="fas fa-save text-info me-2"></i>배치 저장: 현재 배치를 저장합니다</li>
                        <li><i class="fas fa-upload text-warning me-2"></i>배치 불러오기: 저장된 배치를 불러옵니다</li>
                        <li><i class="fas fa-undo text-danger me-2"></i>초기화: 모든 자리를 비웁니다</li>
                        <li><i class="fas fa-edit text-primary me-2"></i>자리 클릭: 학생 이름을 직접 입력하거나 편집할 수 있습니다</li>
                    </ul>
                    <hr>
                    <h6>사용법:</h6>
                    <ul class="list-unstyled small">
                        <li>• 빈 자리 클릭 → 이름 입력 또는 목록에서 선택</li>
                        <li>• 학생이 앉은 자리 클릭 → 이름 변경 또는 자리 비우기</li>
                    </ul>
                    <hr>
                    <small class="text-muted">
                        <kbd>Ctrl+S</kbd>: 자리 섞기 | <kbd>Ctrl+R</kbd>: 초기화
                    </small>
                </div>
            `,
            icon: 'info',
            confirmButtonText: '시작하기',
            confirmButtonColor: '#3b82f6',
            allowOutsideClick: false,
            customClass: {
                popup: 'swal2-popup-custom'
            }
        });
    }

    // Fisher-Yates 셔플 알고리즘 (향상된 버전)
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // 자리 섞기 (애니메이션과 SweetAlert2 포함)
    async shuffleSeats() {
        // 확인 대화상자
        const result = await Swal.fire({
            title: '자리를 섞으시겠습니까?',
            text: '현재 배치가 변경됩니다.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '네, 섞어주세요!',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup-custom'
            }
        });

        if (!result.isConfirmed) return;

        // 로딩 표시
        Swal.fire({
            title: '자리를 섞는 중...',
            html: '<div class="loading mx-auto"></div>',
            allowOutsideClick: false,
            showConfirmButton: false,
            customClass: {
                popup: 'swal2-popup-custom'
            }
        });

        const shuffledStudents = this.shuffleArray(this.students);
        
        // 애니메이션 효과
        this.seats.forEach((seat, index) => {
            seat.classList.add('shuffling');
            setTimeout(() => {
                seat.textContent = shuffledStudents[index];
                seat.classList.add('occupied');
                seat.classList.remove('shuffling');
            }, 100 + index * 50);
        });

        // 완료 후 처리
        setTimeout(() => {
            this.updateStudentList();
            this.updateCounts();
            
            Swal.fire({
                title: '완료!',
                text: '자리가 성공적으로 섞였습니다.',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                confirmButtonColor: '#059669',
                customClass: {
                    popup: 'swal2-popup-custom'
                }
            });
        }, 100 + this.seats.length * 50 + 500);
    }

    // 초기 자리 배치
    assignInitialSeats() {
        this.seats.forEach((seat, index) => {
            seat.textContent = this.students[index];
            seat.classList.add('occupied');
        });
        this.updateStudentList();
        this.updateCounts();
    }

    // 자리 초기화
    async resetSeats() {
        const result = await Swal.fire({
            title: '정말 초기화하시겠습니까?',
            text: '모든 자리 배치가 사라집니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '네, 초기화합니다',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup-custom'
            }
        });

        if (!result.isConfirmed) return;

        this.seats.forEach((seat, index) => {
            setTimeout(() => {
                seat.textContent = `${index + 1}번`;
                seat.classList.remove('occupied');
                seat.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    seat.style.transform = 'scale(1)';
                }, 200);
            }, index * 30);
        });

        setTimeout(() => {
            this.updateStudentList();
            this.updateCounts();
            
            Swal.fire({
                title: '초기화 완료!',
                text: '모든 자리가 초기화되었습니다.',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                confirmButtonColor: '#059669',
                customClass: {
                    popup: 'swal2-popup-custom'
                }
            });
        }, this.seats.length * 30 + 300);
    }

    // 자리 클릭 처리
    async handleSeatClick(seat) {
        if (seat.classList.contains('occupied')) {
            // 학생 이름 변경 또는 제거 옵션
            const result = await Swal.fire({
                title: '자리 관리',
                text: `${seat.textContent}의 자리입니다.`,
                icon: 'question',
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonColor: '#3b82f6',
                denyButtonColor: '#d97706',
                cancelButtonColor: '#6b7280',
                confirmButtonText: '이름 변경',
                denyButtonText: '자리 비우기',
                cancelButtonText: '취소',
                customClass: {
                    popup: 'swal2-popup-custom'
                }
            });

            if (result.isConfirmed) {
                // 이름 변경
                await this.editStudentName(seat);
            } else if (result.isDenied) {
                // 자리 비우기
                const seatNumber = Array.from(this.seats).indexOf(seat) + 1;
                seat.textContent = `${seatNumber}번`;
                seat.classList.remove('occupied');
                this.updateStudentList();
                this.updateCounts();
            }
        } else {
            // 빈 자리에 학생 이름 입력
            await this.assignStudentToSeat(seat);
        }
    }

    // 학생을 자리에 배정
    async assignStudentToSeat(seat) {
        // 이름 직접 입력 또는 기존 학생 선택
        const result = await Swal.fire({
            title: '학생 배정 방법',
            text: '어떤 방법으로 학생을 배정하시겠습니까?',
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonColor: '#3b82f6',
            denyButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '이름 직접 입력',
            denyButtonText: '목록에서 선택',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup-custom'
            }
        });

        if (result.isConfirmed) {
            // 이름 직접 입력
            await this.inputStudentName(seat);
        } else if (result.isDenied) {
            // 기존 목록에서 선택
            await this.selectFromStudentList(seat);
        }
    }

    // 학생 이름 직접 입력
    async inputStudentName(seat) {
        const { value: studentName } = await Swal.fire({
            title: '학생 이름 입력',
            input: 'text',
            inputLabel: '학생의 이름을 입력하세요',
            inputPlaceholder: '예: 김철수, 이영희...',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '배정',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup-custom'
            },
            inputValidator: (value) => {
                if (!value || value.trim() === '') {
                    return '이름을 입력해주세요!';
                }
                if (value.trim().length < 2) {
                    return '이름은 2글자 이상 입력해주세요!';
                }
            }
        });

        if (studentName) {
            const trimmedName = studentName.trim();
            seat.textContent = trimmedName;
            seat.classList.add('occupied');
            this.updateStudentList();
            this.updateCounts();
            
            // 애니메이션 효과
            seat.style.transform = 'scale(1.1)';
            setTimeout(() => {
                seat.style.transform = 'scale(1)';
            }, 200);

            // 성공 메시지
            Swal.fire({
                title: '배정 완료!',
                text: `${trimmedName} 학생이 배정되었습니다.`,
                icon: 'success',
                timer: 1500,
                timerProgressBar: true,
                confirmButtonColor: '#059669',
                customClass: {
                    popup: 'swal2-popup-custom'
                }
            });
        }
    }

    // 기존 학생 목록에서 선택
    async selectFromStudentList(seat) {
        const availableStudents = this.students.filter(student => {
            return !Array.from(this.seats).some(s => s.textContent === student);
        });

        if (availableStudents.length === 0) {
            Swal.fire({
                title: '사용 가능한 학생이 없습니다',
                text: '모든 기본 학생이 이미 배정되었습니다. "이름 직접 입력"을 사용해주세요.',
                icon: 'info',
                confirmButtonColor: '#3b82f6',
                customClass: {
                    popup: 'swal2-popup-custom'
                }
            });
            return;
        }

        const { value: selectedStudent } = await Swal.fire({
            title: '학생을 선택하세요',
            input: 'select',
            inputOptions: availableStudents.reduce((obj, student) => {
                obj[student] = student;
                return obj;
            }, {}),
            inputPlaceholder: '학생을 선택하세요...',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '배정',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup-custom'
            }
        });

        if (selectedStudent) {
            seat.textContent = selectedStudent;
            seat.classList.add('occupied');
            this.updateStudentList();
            this.updateCounts();
            
            // 애니메이션 효과
            seat.style.transform = 'scale(1.1)';
            setTimeout(() => {
                seat.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // 학생 이름 편집
    async editStudentName(seat) {
        const currentName = seat.textContent;
        
        const { value: newName } = await Swal.fire({
            title: '학생 이름 수정',
            input: 'text',
            inputLabel: '새로운 이름을 입력하세요',
            inputValue: currentName,
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '수정',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup-custom'
            },
            inputValidator: (value) => {
                if (!value || value.trim() === '') {
                    return '이름을 입력해주세요!';
                }
                if (value.trim().length < 2) {
                    return '이름은 2글자 이상 입력해주세요!';
                }
            }
        });

        if (newName && newName.trim() !== currentName) {
            const trimmedName = newName.trim();
            seat.textContent = trimmedName;
            this.updateStudentList();
            this.updateCounts();
            
            // 애니메이션 효과
            seat.style.transform = 'scale(1.1)';
            setTimeout(() => {
                seat.style.transform = 'scale(1)';
            }, 200);

            // 성공 메시지
            Swal.fire({
                title: '수정 완료!',
                text: `이름이 "${trimmedName}"로 변경되었습니다.`,
                icon: 'success',
                timer: 1500,
                timerProgressBar: true,
                confirmButtonColor: '#059669',
                customClass: {
                    popup: 'swal2-popup-custom'
                }
            });
        }
    }

    // 배치 저장
    async saveArrangement() {
        const { value: arrangementName } = await Swal.fire({
            title: '배치 저장',
            input: 'text',
            inputLabel: '배치 이름을 입력하세요',
            inputPlaceholder: '예: 수학시간 배치, 발표수업 배치...',
            showCancelButton: true,
            confirmButtonColor: '#0284c7',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '저장',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup-custom'
            },
            inputValidator: (value) => {
                if (!value) {
                    return '배치 이름을 입력해주세요!';
                }
            }
        });

        if (arrangementName) {
            const arrangement = {
                name: arrangementName,
                date: new Date().toLocaleString('ko-KR'),
                seats: this.seats.map(seat => seat.textContent)
            };

            this.savedArrangements.push(arrangement);
            localStorage.setItem('classroomArrangements', JSON.stringify(this.savedArrangements));

            Swal.fire({
                title: '저장 완료!',
                text: `"${arrangementName}" 배치가 저장되었습니다.`,
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                confirmButtonColor: '#059669',
                customClass: {
                    popup: 'swal2-popup-custom'
                }
            });
        }
    }

    // 배치 불러오기
    async loadArrangement() {
        if (this.savedArrangements.length === 0) {
            Swal.fire({
                title: '저장된 배치가 없습니다',
                text: '먼저 배치를 저장해주세요.',
                icon: 'info',
                confirmButtonColor: '#3b82f6',
                customClass: {
                    popup: 'swal2-popup-custom'
                }
            });
            return;
        }

        const options = this.savedArrangements.reduce((obj, arr, index) => {
            obj[index] = `${arr.name} (${arr.date})`;
            return obj;
        }, {});

        const { value: selectedIndex } = await Swal.fire({
            title: '저장된 배치 선택',
            input: 'select',
            inputOptions: options,
            inputPlaceholder: '불러올 배치를 선택하세요...',
            showCancelButton: true,
            confirmButtonColor: '#d97706',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '불러오기',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup-custom'
            }
        });

        if (selectedIndex !== undefined) {
            const arrangement = this.savedArrangements[selectedIndex];
            
            this.seats.forEach((seat, index) => {
                setTimeout(() => {
                    seat.textContent = arrangement.seats[index];
                    if (this.students.includes(arrangement.seats[index])) {
                        seat.classList.add('occupied');
                    } else {
                        seat.classList.remove('occupied');
                    }
                }, index * 30);
            });

            setTimeout(() => {
                this.updateStudentList();
                this.updateCounts();
                
                Swal.fire({
                    title: '불러오기 완료!',
                    text: `"${arrangement.name}" 배치를 불러왔습니다.`,
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: true,
                    confirmButtonColor: '#059669',
                    customClass: {
                        popup: 'swal2-popup-custom'
                    }
                });
            }, this.seats.length * 30 + 300);
        }
    }

    // 저장된 배치 불러오기
    loadSavedArrangements() {
        const saved = localStorage.getItem('classroomArrangements');
        if (saved) {
            this.savedArrangements = JSON.parse(saved);
        }
    }

    // 학생 클릭 처리
    handleStudentClick(studentElement) {
        const studentName = studentElement.textContent;
        
        if (studentElement.classList.contains('assigned')) {
            // 이미 배정된 학생 - 자리 찾아서 하이라이트
            const assignedSeat = Array.from(this.seats).find(seat => seat.textContent === studentName);
            if (assignedSeat) {
                assignedSeat.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.8)';
                assignedSeat.style.transform = 'scale(1.05)';
                
                setTimeout(() => {
                    assignedSeat.style.boxShadow = '';
                    assignedSeat.style.transform = '';
                }, 1500);
            }
        }
    }

    // 학생 목록 업데이트
    updateStudentList() {
        const studentElements = document.querySelectorAll('.student');
        const assignedStudents = Array.from(this.seats)
            .filter(seat => seat.classList.contains('occupied'))
            .map(seat => seat.textContent);

        studentElements.forEach(element => {
            const studentName = element.textContent;
            if (assignedStudents.includes(studentName)) {
                element.classList.remove('unassigned');
                element.classList.add('assigned');
            } else {
                element.classList.remove('assigned');
                element.classList.add('unassigned');
            }
        });
    }

    // 카운트 업데이트
    updateCounts() {
        const assignedCount = this.seats.filter(seat => seat.classList.contains('occupied')).length;
        const unassignedCount = 24 - assignedCount;
        
        document.getElementById('assignedCount').textContent = assignedCount;
        document.getElementById('unassignedCount').textContent = unassignedCount;
    }

    // 학생 명단 관리 모달 이벤트 설정
    setupStudentManagementEvents() {
        const textarea = document.getElementById('studentNamesTextarea');
        const previewDiv = document.getElementById('studentPreview');
        const previewCount = document.getElementById('previewCount');
        
        // 실시간 미리보기 업데이트
        textarea.addEventListener('input', () => {
            this.updateStudentPreview();
        });

        // 현재 명단 불러오기
        document.getElementById('loadFromCurrentBtn').addEventListener('click', () => {
            this.loadCurrentStudentList();
        });

        // 전체 삭제
        document.getElementById('clearNamesBtn').addEventListener('click', () => {
            textarea.value = '';
            this.updateStudentPreview();
        });

        // 명단 적용
        document.getElementById('applyStudentListBtn').addEventListener('click', () => {
            this.applyStudentList();
        });
    }

    // 학생 명단 관리 모달 열기
    openStudentManagementModal() {
        const modal = new bootstrap.Modal(document.getElementById('studentManagementModal'));
        this.loadCurrentStudentList();
        modal.show();
    }

    // 현재 학생 명단을 텍스트영역에 불러오기
    loadCurrentStudentList() {
        const textarea = document.getElementById('studentNamesTextarea');
        
        // 현재 배정된 학생들의 이름을 가져오기
        const currentStudents = [];
        this.seats.forEach(seat => {
            if (seat.classList.contains('occupied')) {
                const studentName = seat.textContent;
                if (studentName && !studentName.includes('번')) {
                    currentStudents.push(studentName);
                }
            }
        });

        // 기본 학생 목록에서 아직 배정되지 않은 학생들 추가
        this.students.forEach(student => {
            if (!currentStudents.includes(student)) {
                currentStudents.push(student);
            }
        });

        textarea.value = currentStudents.join('\n');
        this.updateStudentPreview();
    }

    // 학생 미리보기 업데이트
    updateStudentPreview() {
        const textarea = document.getElementById('studentNamesTextarea');
        const previewDiv = document.getElementById('studentPreview');
        const previewCount = document.getElementById('previewCount');
        
        const names = textarea.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        previewCount.textContent = names.length;
        
        if (names.length === 0) {
            previewDiv.innerHTML = `
                <div class="text-muted text-center py-4">
                    <i class="fas fa-info-circle me-2"></i>
                    좌측에 학생 이름을 입력하면 여기에 미리보기가 표시됩니다.
                </div>
            `;
            return;
        }

        if (names.length > 24) {
            previewDiv.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>경고:</strong> 24명을 초과했습니다. 처음 24명만 적용됩니다.
                </div>
                ${this.generateStudentPreviewHTML(names.slice(0, 24))}
            `;
        } else {
            previewDiv.innerHTML = this.generateStudentPreviewHTML(names);
        }
    }

    // 학생 미리보기 HTML 생성
    generateStudentPreviewHTML(names) {
        return `
            <div class="row g-2">
                ${names.map((name, index) => `
                    <div class="col-6">
                        <div class="d-flex align-items-center p-2 bg-light rounded">
                            <span class="badge bg-primary me-2">${index + 1}</span>
                            <span class="flex-grow-1">${name}</span>
                            <button class="btn btn-sm btn-outline-danger border-0 remove-student" 
                                    data-index="${index}" style="padding: 2px 6px;">
                                <i class="fas fa-times" style="font-size: 10px;"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <script>
                // 개별 학생 제거 버튼 이벤트
                document.querySelectorAll('.remove-student').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.currentTarget.getAttribute('data-index'));
                        const textarea = document.getElementById('studentNamesTextarea');
                        const names = textarea.value.split('\\n').map(name => name.trim()).filter(name => name.length > 0);
                        names.splice(index, 1);
                        textarea.value = names.join('\\n');
                        window.classroom.updateStudentPreview();
                    });
                });
            </script>
        `;
    }

    // 학생 명단 적용
    async applyStudentList() {
        const textarea = document.getElementById('studentNamesTextarea');
        const names = textarea.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0)
            .slice(0, 24); // 최대 24명만

        if (names.length === 0) {
            Swal.fire({
                title: '학생 이름을 입력해주세요',
                text: '최소 1명 이상의 학생 이름을 입력해야 합니다.',
                icon: 'warning',
                confirmButtonColor: '#3b82f6',
                customClass: {
                    popup: 'swal2-popup-custom'
                }
            });
            return;
        }

        // 중복 이름 체크
        const uniqueNames = [...new Set(names)];
        if (uniqueNames.length !== names.length) {
            const result = await Swal.fire({
                title: '중복된 이름이 있습니다',
                text: '중복된 이름을 제거하고 계속하시겠습니까?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#6b7280',
                confirmButtonText: '네, 계속합니다',
                cancelButtonText: '취소',
                customClass: {
                    popup: 'swal2-popup-custom'
                }
            });

            if (!result.isConfirmed) return;
        }

        // 확인 대화상자
        const result = await Swal.fire({
            title: '학생 명단을 적용하시겠습니까?',
            html: `
                <div class="text-start">
                    <p><strong>총 ${uniqueNames.length}명의 학생</strong></p>
                    <div style="max-height: 200px; overflow-y: auto;" class="border rounded p-2 bg-light">
                        ${uniqueNames.map((name, index) => `<div>${index + 1}. ${name}</div>`).join('')}
                    </div>
                    <hr>
                    <small class="text-muted">기존 학생 목록이 새로운 명단으로 교체됩니다.</small>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '적용',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal2-popup-custom'
            }
        });

        if (!result.isConfirmed) return;

        // 학생 목록 업데이트
        this.students = [...uniqueNames];
        
        // 빈 자리 추가 (24자리가 안 되는 경우)
        while (this.students.length < 24) {
            this.students.push(`학생 ${this.students.length + 1}`);
        }

        // 사이드바 학생 목록 업데이트
        this.updateStudentListSidebar();

        // 모달 닫기
        const modal = bootstrap.Modal.getInstance(document.getElementById('studentManagementModal'));
        modal.hide();

        // 성공 메시지
        Swal.fire({
            title: '명단 적용 완료!',
            text: `${uniqueNames.length}명의 학생 명단이 성공적으로 적용되었습니다.`,
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            confirmButtonColor: '#059669',
            customClass: {
                popup: 'swal2-popup-custom'
            }
        });

        // 카운트 업데이트
        this.updateCounts();
    }

    // 사이드바 학생 목록 업데이트
    updateStudentListSidebar() {
        const studentListContainer = document.getElementById('studentList');
        studentListContainer.innerHTML = '';

        this.students.forEach((student, index) => {
            const studentElement = document.createElement('div');
            studentElement.className = 'col-6';
            studentElement.innerHTML = `<div class="student unassigned">${student}</div>`;
            studentListContainer.appendChild(studentElement);
        });

        // 새로운 학생 요소들에 이벤트 리스너 추가
        document.querySelectorAll('.student').forEach(student => {
            student.addEventListener('click', () => this.handleStudentClick(student));
        });

        // 현재 배치 상태 반영
        this.updateStudentList();
    }

    // 현재 자리 배치 정보 가져오기
    getCurrentArrangement() {
        const arrangement = {};
        this.seats.forEach((seat, index) => {
            const row = Math.floor(index / 6) + 1;
            const position = (index % 6) + 1;
            arrangement[`${row}열 ${position}번`] = seat.textContent;
        });
        return arrangement;
    }

    // 자리 배치 정보 출력
    printArrangement() {
        const arrangement = this.getCurrentArrangement();
        console.log('현재 자리 배치:', arrangement);
        return arrangement;
    }
}

// 페이지 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    const classroom = new EnhancedClassroomManager();
    
    // 전역에서 접근 가능하도록 설정 (디버깅 용도)
    window.classroom = classroom;
});

// 키보드 단축키 (향상된 버전)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                document.getElementById('shuffleBtn').click();
                break;
            case 'r':
                e.preventDefault();
                document.getElementById('resetBtn').click();
                break;
            case 'k':
                e.preventDefault();
                document.getElementById('saveBtn').click();
                break;
            case 'l':
                e.preventDefault();
                document.getElementById('loadBtn').click();
                break;
        }
    }
});

// SweetAlert2 커스텀 스타일
document.addEventListener('DOMContentLoaded', () => {
    // SweetAlert2 커스텀 CSS 추가
    const style = document.createElement('style');
    style.textContent = `
        .swal2-popup-custom {
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .swal2-popup-custom .swal2-title {
            font-family: 'Noto Sans KR', sans-serif;
            font-weight: 600;
        }
        
        .swal2-popup-custom .swal2-content {
            font-family: 'Noto Sans KR', sans-serif;
        }
    `;
    document.head.appendChild(style);
});
