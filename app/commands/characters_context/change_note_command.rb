# frozen_string_literal: true

module CharactersContext
  class ChangeNoteCommand < BaseCommand
    use_contract do
      params do
        required(:note).filled(type?: ::Character::Note)
        required(:value).filled(:string, max_size?: 200)
        required(:title).filled(:string, max_size?: 50)
      end
    end

    private

    def do_prepare(input)
      input[:value] = sanitize(input[:value].split("\n").join('<br />'))
    end

    def do_persist(input)
      input[:note].update!(input.except(:note))

      { result: input[:note] }
    end
  end
end
