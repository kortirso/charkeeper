# frozen_string_literal: true

module BotContextV2
  class RepresentCharacterBot
    include RollCheckHelper

    def call(command:, command_result:, provider: nil)
      # app/views/bots_v2/character_bot/check/dnd/attr.text.erb
      # app/views/bots_v2/character_bot/roll/make_roll.text.erb
      b_clone = binding.clone
      command_result.each { |k, v| b_clone.local_variable_set(k, v) }
      text_response = ERB.new(
        Rails.root.join(
          'app/views/bots_v2',
          *['character_bot', command[1..], provider, "#{command_result[:type]}.text.erb"].compact
        ).read
      ).result(b_clone)

      { result: text_response }
    end
  end
end
