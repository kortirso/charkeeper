# frozen_string_literal: true

module ImportContext
  module Pathfinder2
    class PbIdService
      include Deps[
        character_create: 'commands.characters_context.pathfinder2.create',
        character_update: 'commands.characters_context.pathfinder2.update'
      ]

      def call(user:, data:)
        build = fetch_build(data)

        create_result = character_create.call(attributes_for_create(build).merge({ user: user }))
        return create_result if create_result[:errors_list]

        character_update.call(attributes_for_update(build).merge({ character: create_result[:result] }))
      end

      private

      def fetch_build(data)
        # data = { 'build_id' => 111_119 }
        JSON.parse(
          Net::HTTP.get(URI("https://www.pathbuilder2e.com/json.php?id=#{data['build_id']}"))
        )['build']
      end

      def attributes_for_create(data) # rubocop: disable Metrics/AbcSize
        race = ::Pathfinder2::Character.races.find { |_slug, values| values.dig('name', 'en') == data['ancestry'] }
        {
          name: data['name'],
          main_class: data['class'].downcase,
          main_ability: data['keyability'],
          race: race[0],
          subrace: race[1]['subraces'].find { |_slug, values|
            values.dig('name', 'en').downcase.include?(data['heritage'].split[..-2].join(' ').downcase)
          }[0],
          background: ::Pathfinder2::Character.backgrounds.find { |_slug, values|
            values.dig('name', 'en').downcase == data['background'].downcase
          }[0]
        }.compact
      end

      def attributes_for_update(_data)
        {}.compact
      end
    end
  end
end
