function PublicFormPlaceholderPage({ publicPath, onGoLogin }) {
  return (
    <div className="public-form-shell page-enter">
      <section className="public-form-card">
        <p className="public-form-chip">Public Form</p>
        <h1>หน้าฟอร์มสำหรับผู้ตอบ</h1>
        <p>
          URL นี้ถูกเตรียมไว้แล้ว: <strong>/forms/{publicPath}</strong>
        </p>
        <p>
          ตอนนี้หน้าดังกล่าวยังเป็นโครง UI และจะเชื่อมกับฐานข้อมูลจริงในเฟสถัดไป
          เพื่อดึงคำถามแบบ Dynamic ตามโครงการและฟอร์มที่เปิดใช้งาน
        </p>
        <button className="ghost-button" type="button" onClick={onGoLogin}>
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </section>
    </div>
  );
}

export default PublicFormPlaceholderPage;
