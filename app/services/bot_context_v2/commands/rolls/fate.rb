# frozen_string_literal: true

module BotContextV2
  module Commands
    module Rolls
      class Fate
        include Deps[roll_command: 'rolls.fate']

        def call(arguments:)
          rolls = Array.new(4) { roll_command.call }

          if rolls.any?
            return {
              type: 'make_roll',
              result: { rolls: rolls, total: rolls.sum + arguments.sum(&:to_i) }
            }
          end

          { errors: [I18n.t('services.bot_context.representers.roll.nothing')] }
        end
      end
    end
  end
end
