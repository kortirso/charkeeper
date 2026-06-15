# frozen_string_literal: true

module ImportContext
  class Dnd2024
    class BeyondService
      include Deps[
        character_create: 'commands.characters_context.dnd2024.create',
        character_update: 'commands.characters_context.dnd2024.update'
      ]

      def call(user:, data:)
        create_result = character_create.call(attributes_for_create(data).merge({ user: user }))
        return create_result if create_result[:errors_list]

        character_update.call(attributes_for_update(data).merge({ character: create_result[:result] }))
      end

      private

      def attributes_for_create(data)
        {
          name: data['name'],
          species: data['race'],
          legacy: data['subrace'],
          main_class: data['main_class'],
          alignment: data['alignment'] || 'neutral',
          size: 'medium'
        }.compact
      end

      def attributes_for_update(data)
        {
          classes: data['classes'],
          subclasses: data['subclasses'],
          health: { max: data['max_health'], current: data['max_health'], temp: 0 },
          abilities: data['abilities'],
          selected_skills: (data['selected_proficiencies'] & ::Dnd2024::Character.skills.keys).index_with(1),
          languages: data['languages'],
          heroic_inspiration: data['heroic_inspiration'],
          money: data['money'],
          guide_step: nil
        }
      end
    end
  end
end
