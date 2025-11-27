class AddSharedToHomebrews < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :homebrew_books, :public, :boolean, null: false, default: false, comment: 'Открыть доступ для сторонних пользователей'
    add_column :homebrew_races, :public, :boolean, null: false, default: false, comment: 'Открыть доступ для сторонних пользователей'
    add_column :homebrew_communities, :public, :boolean, null: false, default: false, comment: 'Открыть доступ для сторонних пользователей'
    add_column :homebrew_subclasses, :public, :boolean, null: false, default: false, comment: 'Открыть доступ для сторонних пользователей'
    add_column :items, :public, :boolean, null: false, default: false, comment: 'Открыть доступ для сторонних пользователей'
    add_column :daggerheart_homebrew_domains, :public, :boolean, null: false, default: false, comment: 'Открыть доступ для сторонних пользователей'
    add_column :daggerheart_homebrew_transformations, :public, :boolean, null: false, default: false, comment: 'Открыть доступ для сторонних пользователей'
  end
end
