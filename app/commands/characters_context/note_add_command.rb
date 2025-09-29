# frozen_string_literal: true

module CharactersContext
  class NoteAddCommand < BaseCommand
    use_contract do
      params do
        required(:character).filled(type?: ::Character)
        required(:value).filled(:string, max_size?: 200)
        required(:title).filled(:string, max_size?: 50)
      end
    end

    private

    def do_prepare(input)
      input[:value] = sanitize(input[:value].split("\n").join('<br />'))
    end

    def do_persist(input)
      result = input[:character].notes.create!(input.except(:character))

      { result: result }
    end
  end
end
