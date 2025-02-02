class ChangeDefaultLocaleForUsers < ActiveRecord::Migration[7.2]
  def change
    change_column_default :users, :locale, from: 'en', to: 'ru'
  end
end
