# frozen_string_literal: true

module ImportContext
  class Dnd5
    class BeyondService
      include Deps[
        character_create: 'commands.characters_context.dnd5.create',
        character_update: 'commands.characters_context.dnd5.update'
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
          race: data['race'],
          subrace: data['subrace'],
          main_class: data['main_class'],
          alignment: data['alignment'] || 'neutral'
        }.compact
      end

      def attributes_for_update(data)
        {
          classes: data['classes'],
          subclasses: data['subclasses'],
          health: { max: data['max_health'], current: data['max_health'], temp: 0 },
          abilities: data['abilities'],
          selected_skills: data['selected_proficiencies'] & ::Dnd2024::Character.skills.keys,
          languages: data['languages'],
          heroic_inspiration: data['heroic_inspiration'],
          money: data['money']
        }.compact
      end
    end
  end
end
