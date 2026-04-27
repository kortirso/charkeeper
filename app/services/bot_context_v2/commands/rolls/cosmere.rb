# frozen_string_literal: true

module BotContextV2
  module Commands
    module Rolls
      class Cosmere
        include Deps[roll: 'roll']

        def call(arguments:)
          rolls = []
          arguments[0].to_i.times do
            rolls << represent_roll(roll.call(dice: 'd6'))
          end

          if rolls.any?
            return {
              type: 'make_roll',
              result: { rolls: rolls }
            }
          end

          { errors: [I18n.t('services.bot_context.representers.roll.nothing')] }
        end

        private

        def represent_roll(value)
          case value
          when 1 then 'light_complication'
          when 2 then 'heavy_complication'
          when 5, 6 then 'opportunity'
          else 'blank'
          end
        end
      end
    end
  end
end
