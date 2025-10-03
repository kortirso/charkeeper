class CreateUserHomebrews < ActiveRecord::Migration[8.0]
  def change
    create_table :user_homebrews, id: :uuid, comment: 'Заранее сформированный список всех доступных homebrew' do |t|
      t.uuid :user_id, null: false
      t.jsonb :data, null: false, default: {}
      t.timestamps
    end
    add_index :user_homebrews, :user_id
  end
end
