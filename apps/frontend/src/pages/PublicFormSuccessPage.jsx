function PublicFormSuccessPage({
  publicPath,
  submissionCode,
  title,
  message,
  allowMultiple,
  onFillAgain
}) {
  return (
    <div className="public-form-shell page-enter">
      <section className="public-form-card public-form-card-status">
        <p className="public-form-chip">สำเร็จ</p>
        <h1>{title || "ส่งแบบฟอร์มสำเร็จ"}</h1>
        <p>{message || "ระบบบันทึกข้อมูลของคุณแล้ว"}</p>
        <p>รหัสอ้างอิง: {submissionCode || "-"}</p>
        {allowMultiple ? (
          <div className="inline-action-row" style={{ marginTop: 12 }}>
            <button className="primary-button" type="button" onClick={onFillAgain}>
              กรอกฟอร์มอีกครั้ง
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default PublicFormSuccessPage;
