class CreateNotifications < ActiveRecord::Migration[8.0]
  def change
    create_table :notifications, id: :uuid do |t|
      t.text :value, null: false
      t.string :locale, null: false, comment: 'Локаль пользователя для получения'
      t.string :targets, array: true, null: false, default: [], comment: 'Получатели отправлений'
      t.timestamps
    end
  end
end
