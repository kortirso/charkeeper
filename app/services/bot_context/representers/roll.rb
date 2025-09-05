# frozen_string_literal: true

module BotContext
  module Representers
    class Roll
      def call(source:, command_result:)
        case source
        when :web then represent_web(command_result)
        when :telegram_bot, :telegram_group_bot then represent_telegram(command_result)
        end
      end

      private

      # rubocop: disable Layout/LineLength
      def represent_web(command_result)
        return I18n.t('services.bot_context.representers.roll.nothing') if command_result[:rolls].empty?

        formatted_result = command_result[:rolls].map { |item| "#{item[0]} (#{item[1]})" }.join(', ')
        "#{I18n.t('services.bot_context.representers.roll.result')}: #{formatted_result}<br />#{I18n.t('services.bot_context.representers.roll.total')}: #{command_result[:total]}"
      end

      def represent_telegram(command_result)
        return I18n.t('services.bot_context.representers.roll.nothing') if command_result[:rolls].empty?

        formatted_result = command_result[:rolls].map { |item| "#{item[0]} (#{item[1]})" }.join(', ')
        "<b>#{I18n.t('services.bot_context.representers.roll.result')}</b>: #{formatted_result}\n<b>#{I18n.t('services.bot_context.representers.roll.total')}</b>: #{command_result[:total]}"
      end
      # rubocop: enable Layout/LineLength
    end
  end
end
