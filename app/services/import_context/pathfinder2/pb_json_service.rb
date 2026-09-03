# frozen_string_literal: true

module ImportContext
  module Pathfinder2
    class PbJsonService
      include Deps[
        character_create: 'commands.characters_context.pathfinder2.create',
        character_update: 'commands.characters_context.pathfinder2.update'
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

      def attributes_for_update(_data)
        {}.compact
      end
    end
  end
end
