# frozen_string_literal: true

module CharactersContext
  class ChangeFeatCommand < BaseCommand
    use_contract do
      config.messages.namespace = :character_feat

      params do
        required(:character_feat).filled(type?: ::Character::Feat)
        optional(:used_count).filled(:integer)
        optional(:value).maybe(:string)
      end
    end

    private

    def do_persist(input)
      input[:character_feat].update!(input.except(:character_feat))

      { result: input[:character_feat] }
    end
  end
end
