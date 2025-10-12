# frozen_string_literal: true

module BotContext
  class RepresentCommandService
    TELEGRAM_SOURCES = %i[telegram_bot telegram_group_bot].freeze

    def call(source:, command:, command_result:)
      return command_result if source == :raw

      source = :telegram if source.in?(TELEGRAM_SOURCES)

      # app/views/bots/web/homebrew/add_race.text.erb
      template = ERB.new(
        Rails.root.join('app/views/bots', source.to_s, command[1..], "#{command_result[:type]}.text.erb").read
      )
      { result: template.result_with_hash(command_result).strip }
    end
  end
end
