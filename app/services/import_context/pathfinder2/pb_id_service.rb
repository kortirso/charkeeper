# frozen_string_literal: true

module ImportContext
  module Pathfinder2
    class PbIdService
      include Deps[
        character_create: 'commands.characters_context.pathfinder2.create',
        character_update: 'commands.characters_context.pathfinder2.update',
        add_item: 'commands.characters_context.items.add'
      ]

      def call(user:, data:)
        build = fetch_build(data)
        return { errors: { import: ['Not found'] }, errors_list: ['Not found'] } unless build

        create_result = character_create.call(attributes_for_create(build).merge({ user: user }))
        if create_result[:errors_list]
          return { errors: { import: ['Not enough data for import'] }, errors_list: ['Not enough data for import'] }
        end

        character = create_result[:result]
        add_items(build, character)
        character_update.call(attributes_for_update(build).merge({ character: character }))
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
          race: race&.dig(0),
          subrace: race&.dig(1, 'subraces')&.find { |_slug, values|
            values.dig('name', 'en').downcase.include?(data['heritage'].split[..-2].join(' ').downcase)
          }&.dig(0),
          background: ::Pathfinder2::Character.backgrounds.find { |_slug, values|
            values.dig('name', 'en').downcase == data['background'].downcase
          }&.dig(0)
        }.compact
      end

      def attributes_for_update(data) # rubocop: disable Metrics/AbcSize
        skills = data['proficiencies'].slice(*Config.data('pathfinder2', 'skills').keys).transform_values { |value| value / 2 }
        lores = data['lores'].each_with_object({}) do |item, acc|
          lore_id = SecureRandom.alphanumeric(10)
          skills[lore_id] = item[1] / 2
          acc[lore_id] = item[0]
        end

        {
          level: data['level'],
          abilities: data['abilities'],
          selected_skills: skills,
          lores: lores,
          health: { current: 1, temp: 0 },
          money: money(data),
          languages: languages(data)
        }.compact
      end

      def money(data)
        data.dig('money', 'cp') +
          (data.dig('money', 'sp') * 10) +
          (data.dig('money', 'gp') * 100) +
          (data.dig('money', 'pp') * 1_000)
      end

      def languages(build)
        default_languages = ::Pathfinder2::Character.languages.to_h { |slug, values| [values.dig('name', 'en'), slug] }
        build['languages'].map do |language|
          default_languages[language] || language
        end
      end

      def add_items(build, character) # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
        build['equipment'].each do |element|
          item = ::Pathfinder2::Item.where(user_id: nil).find_by("lower(name ->> 'en') = ?", element[0].downcase)
          next unless item

          add_item.call(character: character, item: item, state: 'backpack', amount: element[1])
        end

        weapons = build['weapons'].each_with_object({}) do |item, acc|
          acc[item['name']] ||= 0
          acc[item['name']] += 1
        end
        weapons.each do |name, amount|
          item = ::Pathfinder2::Item.where(kind: 'weapon', user_id: nil).find_by("lower(name ->> 'en') = ?", name.downcase)
          next unless item

          add_item.call(character: character, item: item, state: 'backpack', amount: amount)
        end

        armor = build['armor'].each_with_object({}) do |item, acc|
          acc[item['name']] ||= 0
          acc[item['name']] += 1
        end
        armor.each do |name, amount|
          item = ::Pathfinder2::Item.where(kind: 'armor', user_id: nil).find_by("lower(name ->> 'en') = ?", name.downcase)
          next unless item

          add_item.call(character: character, item: item, state: 'backpack', amount: amount)
        end
      end
    end
  end
end
