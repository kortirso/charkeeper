class AddProviderLocalesForUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :provider_locales, :jsonb, default: {}, comment: 'Альтернативные переводы'
  end
end
