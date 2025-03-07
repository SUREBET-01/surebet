// Adiciona evento de input para os campos de stake na tabela de cálculo
// Isso aciona o recálculo do valor das apostas

e("#calc_table input.stake").on("input", function(event) {
    return $(this, null, function*() {
        if (yield ee(), !_(event.target)) {
            ajustarStakeBack(n, e(this));  // Ajusta stake para aposta back
            var modoCalculo = obterModoCalculo(n);
            var numeroAposta = e(this).attr("data-number");
            
            if (numeroAposta == modoCalculo) {
                recalcularTudo();   // Recalcula completamente
            } else {
                atualizarValores(n); // Atualiza valores após mudanças
            }
        }
    });
});

// Adiciona evento de input para os campos de backers_stake
// Recalcula valores ao alterar individualmente a stake do lay

e("#calc_table input.backers_stake").on("input", function(event) {
    return $(this, null, function*() {
        yield ee();
        if (!_(event.target)) {
            ajustarStakeLay(n, e(this)); // Ajusta stake para lay
            atualizarValores(n);        // Atualiza os valores calculados
        }
    });
});

// Função principal para recalcular valores e atualizar a interface
function atualizarValores(n) {
    var todasStakes = obterStakes(n);      // Obtém todas as stakes
    var novosValores = calcularNovosValores(n, todasStakes);  // Calcula os novos valores
    var matriz = obterMatriz(n.data("matrix")); // Obtém dados da matriz
    var matrizTransformada = obterMatriz([novosValores]).transpose();
    
    try {
        var resultado = V(matriz.x(matrizTransformada)); // Aplica transformação na matriz
    } catch (erro) {
        // Captura erro no cálculo da matriz e reporta
        window.Sentry && window.Sentry.captureMessage(`Erro: M=${JSON.stringify(matriz)} B=${JSON.stringify(matrizTransformada)} stakes=${novosValores} stakes0=${todasStakes}`);
        throw erro;
    }
    
    atualizarStakesNaTela(n, normalizarValores(n, resultado)); // Atualiza os valores na interface
    
    // Se for necessário, aplica cálculos adicionais
    if (n.data("isMiddle")) {
        aplicarCalculoAdicional(n, novosValores);
    }
}

// Ajusta stake para uma aposta back com base no lay
function ajustarStakeBack(n, elemento) {
    if (elemento.data("lay")) {
        var numeroAposta = e(elemento).attr("data-number");
        var coeficiente = obterCoeficiente(n, numeroAposta);
        var novoValor = Number(converterValor(elemento.val())) / (coeficiente - 1);
        
        n.find("tr[data-number='" + numeroAposta + "'] input.backers_stake").val(formatarValor(novoValor));
    }
}

// Ajusta stake para uma aposta lay com base no back
function ajustarStakeLay(n, elemento) {
    var numeroAposta = e(elemento).closest("tr[data-number]").attr("data-number");
    var coeficiente = obterCoeficiente(n, numeroAposta);
    var novoValor = Number(converterValor(elemento.val())) * (coeficiente - 1);
    
    n.find("tr.prong[data-number='" + numeroAposta + "'] input.stake").val(formatarValor(novoValor));
}

// Obtém todas as stakes da tabela
function obterStakes(n) {
    return n.find("tr.prong input.stake").map(function() {
        return converterValor(e(this).val());
    });
}

// Obtém coeficiente de uma aposta específica
function obterCoeficiente(n, numeroAposta) {
    return converterParaDecimal(n, converterValor(n.find(`tr.prong[data-number='${numeroAposta}'] input.koefficient`).val()));
}

// Converte valor para formato decimal baseado no formato de odd
function converterParaDecimal(n, valor) {
    return st[n.data("oddFormat")].toDecimal(valor);
}

// Adiciona evento para ajuste de arredondamento

e("#roundTo").on("input", function(event) {
    return $(this, null, function*() {
        yield ee();
        if (!_(event.target)) {
            aplicarArredondamento(e(this).val());
            recalcularTudo();
        }
    });
});
