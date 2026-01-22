# frozen_string_literal: true

module CharactersContext
  module Items
    class ConsumeCommand < BaseCommand
      include Deps[formula: 'formula']

      use_contract do
        params do
          required(:character).filled(type?: ::Character)
          required(:character_item).filled(type?: ::Character::Item)
          required(:from_state).filled(:string)
        end
      end

      private

      def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/MethodLength
        input[:attributes] = {}
        input[:result] = []

        input[:character_item].item.info['consume'].each do |consume|
          result = formula.call(formula: consume['formula'])

          if input[:character].is_a?(::Daggerheart::Character)
            input[:attributes][consume['attribute']] = [input[:character].data.attributes[consume['attribute']] + result, 0].max
          elsif input[:character].is_a?(::Dnd2024::Character) || input[:character].is_a?(::Dnd5::Character)
            input[:attributes][consume['attribute']] ||= input[:character].data[consume['attribute']]
            input[:attributes][consume['attribute']]['current'] =
              [input[:character].data.attributes[consume['attribute']]['current'] + result, 0].max
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
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input[:attributes])
        input[:character].save!

        input[:character_item].states[input[:from_state]] -= 1
        input[:character_item].save!

        { result: input[:result].join('; ') }
      end
    end
  end
end
