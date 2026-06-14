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
        desc = data['unitDesc'].split('.')[0].split
        {
          name: data['unitName'],
          race: desc[0].parameterize(separator: '-').underscore,
          subrace: nil,
          main_class: desc[1].underscore,
          alignment: data['alignment'].parameterize(separator: '_').underscore
        }.compact
      end

      def attributes_for_update(data) # rubocop: disable Metrics/AbcSize
        {
          level: data['challengeRating'].split[0].to_i,
          health: { max: data['maxHP'], current: data['maxHP'], temp: 0 },
          abilities: {
            str: data['strScore'], dex: data['dexScore'], con: data['conScore'],
            int: data['intScore'], wis: data['wisScore'], cha: data['chaScore']
          },
          selected_skills: data['skills'].split(', ').map { |item| item.split[0].underscore },
          languages: data['languages'].split(', ').map(&:underscore)
        }
      end
    end
  end
end
