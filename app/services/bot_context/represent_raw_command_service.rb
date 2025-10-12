# frozen_string_literal: true

module BotContext
  class RepresentRawCommandService
    include RollCheckHelper

    def call(source:, command:, provider:, command_result:)
      # app/views/bots/telegram/check/dnd/attr.text.erb
      b_clone = binding.clone
      command_result.each { |k, v| b_clone.local_variable_set(k, v) }
      text_response = ERB.new(
        Rails.root.join('app/views/bots', source.to_s, command[1..], provider, "#{command_result[:type]}.text.erb").read
      ).result(b_clone)

      { result: text_response }
    end
  end
end
