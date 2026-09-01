# frozen_string_literal: true

module CharactersContext
  module Items
    class ConsumeCommand < BaseCommand
      include Deps[
        formula: 'formula',
        character_item_update: 'commands.characters_context.items.update'
      ]

      DND_CONSUMERS = ['Dnd2024::Character', 'Dnd5::Character', 'Nimble::Character'].freeze
      DIRECT_CONSUMERS = ['Daggerheart::Character', 'Pathfinder2::Character'].freeze

      use_contract do
        params do
          required(:character).filled(type?: ::Character)
          required(:character_item).filled(type?: ::Character::Item)
          required(:from_state).filled(:string)
        end
      end

      private

      def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
        input[:attributes] = {}
        input[:result] = []

        input[:character_item].item.info['consume'].each do |consume|
          result = formula.call(formula: consume['formula'])

          if DIRECT_CONSUMERS.include?(input[:character].class.name)
            input[:attributes][consume['attribute']] = [input[:character].data.attributes[consume['attribute']] + result, 0].max
          elsif DND_CONSUMERS.include?(input[:character].class.name)
            input[:attributes][consume['attribute']] ||= input[:character].data[consume['attribute']]
            input[:attributes][consume['attribute']]['current'] =
              (input[:character].data.attributes.dig(consume['attribute'], 'current') + result).clamp(
                0,
                input[:character].data.attributes.dig(consume['attribute'], 'max')
              )
          end

          if consume['result']
            input[:result].push(consume['result'][I18n.locale.to_s].gsub('{{value}}', result.abs.to_s))
          else
            input[:result].push(
              I18n.t(
                'commands.characters_context.items.consume.done',
                value: input[:character_item].item.name[I18n.locale.to_s],
                roll: result.abs.to_s
              )
            )
          end
        end

        input[:states] = input[:character_item].states
        input[:states][input[:from_state]] -= 1
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.deep_merge(input[:attributes])
        input[:character].save!

        character_item_update.call(character_item: input[:character_item], states: input[:states])

        { result: input[:result].join('; ') }
      end
    end
  end
end
