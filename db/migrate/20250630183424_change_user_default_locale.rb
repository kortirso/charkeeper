class ChangeUserDefaultLocale < ActiveRecord::Migration[8.0]
  def change
    change_column_default :users, :locale, from: 'ru', to: 'en'
  end
end
