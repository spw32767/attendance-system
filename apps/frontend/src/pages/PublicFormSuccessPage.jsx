function PublicFormSuccessPage({ publicPath, submissionCode, title, message, onGoLogin, onFillAgain }) {
  return (
    <div className="public-form-shell page-enter">
      <section className="public-form-card">
        <p className="public-form-chip">สำเร็จ</p>
        <h1>{title || "ส่งแบบฟอร์มสำเร็จ"}</h1>
        <p>{message || "ระบบบันทึกข้อมูลของคุณแล้ว"}</p>
        <p>รหัสอ้างอิง: {submissionCode || "-"}</p>
        <div className="inline-action-row" style={{ marginTop: 12 }}>
          <button className="ghost-button" type="button" onClick={onFillAgain}>
            กรอกฟอร์มอีกครั้ง
          </button>
          <button className="primary-button" type="button" onClick={onGoLogin}>
            กลับหน้าเข้าสู่ระบบ
          </button>
        </div>
        <p style={{ marginTop: 12, fontSize: "0.9rem" }}>
          ลิงก์แบบฟอร์ม: /forms/{publicPath}
        </p>
      </section>
    </div>
  );
}

export default PublicFormSuccessPage;
