# frozen_string_literal: true

module BotContext
  module Representers
    class Homebrew
      def call(source:, command_result:)
        case source
        when :web then represent_web(command_result)
        when :telegram_bot, :telegram_group_bot then represent_telegram(command_result)
        end
      end

      private

      def represent_web(command_result)
        case command_result[:type]
        when 'add_race' then represent_web_add_race(command_result)
        when 'add_community' then represent_web_add_community(command_result)
        end
      end

      def represent_telegram(command_result); end

      def represent_web_add_race(command_result)
        return { errors: command_result[:errors] } if command_result[:errors]

        { result: I18n.t('services.bot_context.representers.homebrew.add_race.result', name: command_result[:result].name) }
      end

      def represent_web_add_community(command_result)
        return { errors: command_result[:errors] } if command_result[:errors]

        { result: I18n.t('services.bot_context.representers.homebrew.add_community.result', name: command_result[:result].name) }
      end
    end
  end
end
