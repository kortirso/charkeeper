# frozen_string_literal: true

module BotContext
  module Representers
    class Book
      def call(source:, command_result:)
        case source
        when :web then represent_web(command_result)
        when :telegram_bot, :telegram_group_bot then represent_telegram(command_result)
        end
      end

      private

      def represent_web(command_result)
        case command_result[:type]
        when 'create' then represent_web_create(command_result)
        when 'list' then represent_web_list(command_result)
        when 'remove' then represent_web_remove(command_result)
        when 'show', 'set' then represent_web_show(command_result)
        when 'add_race' then represent_web_add_race
        when 'export' then represent_web_export(command_result)
        end
      end

      def represent_telegram(command_result); end

      def represent_web_create(command_result)
        return { errors: [command_result[:errors].values.dig(0, 0)] } if command_result[:errors]

        { result: I18n.t('services.bot_context.representers.book.create.result', name: command_result[:result].name) }
      end

      def represent_web_list(command_result)
        list = command_result[:result].map { |item| I18n.t("providers.#{item[:provider]}") + " - #{item[:name]}" }.join('<br />')
        { result: list }
      end

      def represent_web_show(command_result)
        { result: I18n.t("providers.#{command_result[:result].provider}") + " - #{command_result[:result].name}" }
      end

      def represent_web_remove(command_result)
        return { errors: [command_result[:errors].values.dig(0, 0)] } if command_result[:errors]

        { result: I18n.t('services.bot_context.representers.book.remove.result') }
      end

      def represent_web_add_race
        { result: 'Done' }
      end

      def represent_web_export(command_result)
        { result: "For importing module call<br />\"/module import #{command_result[:result].id}\"" }
      end
    end
  end
end
