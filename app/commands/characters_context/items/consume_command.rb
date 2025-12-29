# frozen_string_literal: true

module CharactersContext
  module Items
    class ConsumeCommand < BaseCommand
      include Deps[roll: 'roll']

      use_contract do
        params do
          required(:character).filled(type?: ::Character)
          required(:character_item).filled(type?: ::Character::Item)
          required(:from_state).filled(:string)
        end
      end

      private

      def do_prepare(input) # rubocop: disable Metrics/AbcSize
        input[:attributes] = {}
        input[:result] = []

        input[:character_item].item.info['consume'].each do |consume|
          dice, modifier = consume['roll'].gsub(/\s+/, '').split('+')
          roll_result = dice.include?('d') ? roll.call(dice: dice, modifier: modifier.to_i) : dice.to_i

          input[:attributes][consume['attribute']] =
            if consume['direction'] == 'down'
              [input[:character].data.attributes[consume['attribute']] - roll_result, 0].max
            else
              input[:character].data.attributes[consume['attribute']] + roll_result
            end

          input[:result].push(consume['result'][I18n.locale.to_s].gsub('{{value}}', roll_result.to_s))
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
