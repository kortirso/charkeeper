# frozen_string_literal: true

module BotContext
  module Commands
    class Homebrew
      include Deps[
        add_race: 'commands.homebrew_context.add_race',
        add_daggerheart_community: 'commands.homebrew_context.daggerheart.add_community',
        add_daggerheart_transformation: 'commands.homebrew_context.daggerheart.add_transformation'
      ]

      def call(source:, arguments:, data:) # rubocop: disable Lint/UnusedMethodArgument
        return if data[:user].nil?

        case arguments.shift
        when 'createRace' then create_race(*arguments, data)
        when 'createCommunity' then create_community(*arguments, data)
        when 'createTransformation' then create_transformation(*arguments, data)
        end
      end

      private

      def create_race(*arguments, data)
        values = BotContext::Commands::Parsers::CreateRace.new.call(arguments: arguments)
        command_params = values.except(:system).merge(user: data[:user])
        result =
          case values[:system]
          when 'daggerheart' then add_race.call(command_params.merge(type: 'Daggerheart::Homebrew::Race'))
          when 'dnd2024' then add_race.call(command_params.merge(type: 'Dnd2024::Homebrew::Race'))
          else { errors_list: ['Invalid command'] }
          end

        {
          type: 'create_race',
          result: result[:result],
          errors: result[:errors_list]
        }
      end

      def create_community(*arguments, data)
        result = add_daggerheart_community.call({ user: data[:user], name: arguments[0] })
        {
          type: 'create_community',
          result: result[:result],
          errors: result[:errors_list]
        }
      end

      def create_transformation(*arguments, data)
        result = add_daggerheart_transformation.call({ user: data[:user], name: arguments[0] })
        {
          type: 'create_transformation',
          result: result[:result],
          errors: result[:errors_list]
        }
      end
    end
  end
end
