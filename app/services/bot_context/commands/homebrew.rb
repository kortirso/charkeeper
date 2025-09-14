# frozen_string_literal: true

module BotContext
  module Commands
    class Homebrew
      include Deps[
        add_daggerheart_race: 'commands.homebrew_context.daggerheart.add_race',
        add_daggerheart_community: 'commands.homebrew_context.daggerheart.add_community'
      ]

      def call(source:, arguments:, data:) # rubocop: disable Lint/UnusedMethodArgument
        case arguments.shift
        when 'createRace' then create_race(*arguments, data)
        when 'createCommunity' then create_community(*arguments, data)
        end
      end

      private

      def create_race(*arguments, data)
        result =
          case arguments[0]
          when 'daggerheart' then add_daggerheart_race.call({ user: data[:user], name: arguments[1] })
          else { errors_list: ['Invalid command'] }
          end

        {
          type: 'create_race',
          result: result[:result],
          errors: result[:errors_list]
        }
      end

      def create_community(*arguments, data)
        result =
          case arguments[0]
          when 'daggerheart' then add_daggerheart_community.call({ user: data[:user], name: arguments[1] })
          else { errors_list: ['Invalid command'] }
          end

        {
          type: 'create_community',
          result: result[:result],
          errors: result[:errors_list]
        }
      end
    end
  end
end
