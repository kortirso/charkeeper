# frozen_string_literal: true

module Homebrews
  module Daggerheart
    module Books
      class ContentController < Homebrews::BaseController
        include Deps[
          add_book_races_command: 'commands.homebrew_context.daggerheart.add_book_races',
          add_book_communities_command: 'commands.homebrew_context.daggerheart.add_book_communities',
          add_book_transformations_command: 'commands.homebrew_context.daggerheart.add_book_transformations',
          add_book_domains_command: 'commands.homebrew_context.daggerheart.add_book_domains',
          add_book_subclasses_command: 'commands.homebrew_context.daggerheart.add_book_subclasses',
          add_book_items_command: 'commands.homebrew_context.daggerheart.add_book_items'
        ]

        def create; end
      end
    end
  end
end
