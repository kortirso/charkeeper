class AddHbSubclassesDnd < ActiveRecord::Migration[8.1]
  def up
    ::Dnd2024::Homebrew::Subclass.find_each do |item|
      ::Dnd2024::Homebrews::Subclass.create(
        id: item.id,
        user_id: item.user_id,
        title: { en: item.name, ru: item.name },
        public: item.public,
        discarded_at: item.discarded_at,
        description: { en: '', ru: '' },
        info: {
          class_id: item.class_name
        }
      )
    end
  end

  def down; end
end
