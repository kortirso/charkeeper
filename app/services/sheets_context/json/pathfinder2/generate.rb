# frozen_string_literal: true

module SheetsContext
  module Json
    module Pathfinder2
      class Generate
        def to_json(character:)
          decorator = character.decorator

          {
            name: decorator.name,
            info: decorator.info,
            race: decorator.race,
            subrace: decorator.subrace,
            background: decorator.background,
            main_class: decorator.main_class,
            health: decorator.health,
            armor_class: decorator.armor_class,
            level: decorator.level
          }
        end
      end
    end
  end
end
