# frozen_string_literal: true

module DaggerheartCharacter
  class BaseDecorator
    def decorate_fresh_character(heritage:, main_class:)
      {
        heritage: heritage,
        main_class: main_class,
        classes: { main_class => 1 }
      }.compact
    end

    def decorate_character_abilities(character:)
      data = character.data

      {
        heritage: data.heritage,
        main_class: data.main_class,
        classes: data.classes,
        overall_level: data.level,
        traits: data.traits
      }.compact
    end
  end
end
